
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

/* =========================
   MIDDLEWARE
========================= */
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

/* =========================
   DATABASE
========================= */

console.log(
  'MONGO_URI exists:',
  !!process.env.MONGO_URI
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      'MongoDB connected successfully'
    );
  })
  .catch((error) => {
    console.error(
      'MongoDB connection error:',
      error
    );
  });

/* =========================
   ROUTES
========================= */

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/instructors',
  require('./routes/instructors')
);

app.use(
  '/api/availability',
  require('./routes/availability')
);

app.use(
  '/api/bookings',
  require('./routes/bookings')
);

/* =========================
   PAYMENTS
========================= */

/*
  Development payment endpoints:
  GET  /api/payments/catalog
  POST /api/payments/dev/session
  GET  /api/payments/my

  Development sessions create pending records only.
  No real payment is collected.
*/

app.use(
  '/api/payments',
  require('./routes/payments')
);

app.use(
  '/api/instructor-setup',
  require('./routes/instructorSetup')
);

app.use(
  '/api/lesson-progress',
  require('./routes/lessonProgress')
);
app.use(
  '/api/coupons',
  require('./routes/coupons')
);
// Contact form
app.use('/api/contact', require('./routes/contact'));
/* =========================
   PROGRESS ROUTE
========================= */

try {
  app.use(
    '/api/progress',
    require('./routes/progress')
  );
} catch (error) {
  console.log(
    'Progress route not loaded.'
  );
}

/* =========================
   ROOT ROUTE
========================= */

app.get(
  '/',
  (req, res) => {
    res.send(
      'Geonix backend is running!'
    );
  }
);

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST'],
  },
});

/* =========================
   MODELS
========================= */

const Booking =
  require('./models/Booking');

/* =========================
   CLASSROOM ROOMS
========================= */

/*
  Map structure:

  classroom-bookingId
      ↓
  Set of socket IDs

  Maximum:
  2 participants
*/

const classroomRooms =
  new Map();

/* =========================
   SOCKET AUTHENTICATION
========================= */

io.use(
  (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            'Authentication token required.'
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      socket.userId =
        decoded.id;

      next();
    } catch (error) {
      console.error(
        'Socket authentication error:',
        error.message
      );

      next(
        new Error(
          'Invalid or expired authentication token.'
        )
      );
    }
  }
);

/* =========================
   SOCKET CONNECTION
========================= */

io.on(
  'connection',
  (socket) => {
    console.log(
      'Socket connected:',
      socket.id
    );

    console.log(
      'User ID:',
      socket.userId
    );

    /* =========================
       JOIN CLASSROOM
    ========================= */

    socket.on(
      'join-classroom',
      async (bookingId) => {
        try {
          console.log(
            '===================================='
          );

          console.log(
            'JOIN CLASSROOM REQUEST'
          );

          console.log(
            'BOOKING ID:',
            bookingId
          );

          console.log(
            'USER ID:',
            socket.userId
          );

          console.log(
            'SOCKET ID:',
            socket.id
          );

          console.log(
            '===================================='
          );

          /* =========================
             VALIDATE BOOKING ID
          ========================= */

          if (!bookingId) {
            return socket.emit(
              'classroom-error',
              {
                message:
                  'Booking ID is required.',
              }
            );
          }

          /* =========================
             FIND BOOKING
          ========================= */

          const booking =
            await Booking.findById(
              bookingId
            );

          if (!booking) {
            return socket.emit(
              'classroom-error',
              {
                message:
                  'Booking not found.',
              }
            );
          }

          /* =========================
             CHECK PARTICIPANT
          ========================= */

          const isStudent =
            String(
              booking.student
            ) ===
            String(
              socket.userId
            );

          const isInstructor =
            String(
              booking.instructor
            ) ===
            String(
              socket.userId
            );

          if (
            !isStudent &&
            !isInstructor
          ) {
            return socket.emit(
              'classroom-error',
              {
                message:
                  'You are not a participant in this lesson.',
              }
            );
          }

          /* =========================
             CHECK STATUS
          ========================= */

          if (
            booking.status !==
            'confirmed'
          ) {
            return socket.emit(
              'classroom-error',
              {
                message:
                  `This classroom is only available for confirmed lessons. Current status: ${booking.status}`,
              }
            );
          }

          /* =========================
             ROOM ID
          ========================= */

          const roomId =
            `classroom-${bookingId}`;

          /* =========================
             EXISTING ROOM
          ========================= */

          let room =
            classroomRooms.get(
              roomId
            );

          if (!room) {
            room = new Set();

            classroomRooms.set(
              roomId,
              room
            );
          }

          /* =========================
             PREVENT DUPLICATE SOCKET
          ========================= */

          if (
            room.has(socket.id)
          ) {
            console.log(
              'Socket already in classroom.'
            );

            return;
          }

          /* =========================
             MAX TWO PARTICIPANTS
          ========================= */

          if (
            room.size >= 2
          ) {
            console.log(
              'Classroom is full.'
            );

            return socket.emit(
              'classroom-full'
            );
          }

          /* =========================
             PREVENT SAME USER
             JOINING TWICE
          ========================= */

          const existingUserSocket =
            Array.from(room).find(
              (socketId) => {
                const existingSocket =
                  io.sockets.sockets.get(
                    socketId
                  );

                return (
                  existingSocket &&
                  String(
                    existingSocket.userId
                  ) ===
                    String(
                      socket.userId
                    )
                );
              }
            );

          if (existingUserSocket) {
            console.log(
              'This user already has a socket in the classroom:',
              socket.userId
            );

            return socket.emit(
              'classroom-error',
              {
                message:
                  'Your account is already connected to this classroom. Close the other classroom tab and try again.',
              }
            );
          }

          /* =========================
             JOIN SOCKET ROOM
          ========================= */

          socket.join(roomId);

          room.add(socket.id);

          socket.classroomId =
            roomId;

          socket.bookingId =
            bookingId;

          socket.classroomRole =
            isInstructor
              ? 'instructor'
              : 'student';

          console.log(
            'CLASSROOM ROOM:',
            roomId
          );

          console.log(
            'ROOM SIZE:',
            room.size
          );

          console.log(
            'ROLE:',
            socket.classroomRole
          );

          /* =========================
             CONFIRM JOIN
          ========================= */

          socket.emit(
            'classroom-joined',
            {
              bookingId,
              role:
                socket.classroomRole,

              participantCount:
                room.size,
            }
          );

          /* =========================
             NOTIFY EXISTING PARTICIPANT
          ========================= */

          if (room.size > 1) {
            socket.to(roomId).emit(
              'peer-joined'
            );
          }

          /* =========================
             ROOM READY
          ========================= */

          if (room.size === 2) {
            const participants =
              Array.from(room);

            /*
              First participant becomes
              WebRTC initiator.
            */

            const initiatorId =
              participants[0];

            io.to(roomId).emit(
              'room-ready',
              {
                initiator:
                  socket.id ===
                  initiatorId,
              }
            );

            console.log(
              'ROOM READY:',
              roomId
            );

            console.log(
              'INITIATOR:',
              initiatorId
            );
          }
        } catch (error) {
          console.error(
            'JOIN CLASSROOM ERROR:',
            error
          );

          socket.emit(
            'classroom-error',
            {
              message:
                'Could not join the classroom.',
            }
          );
        }
      }
    );

    /* =========================
       WEBRTC OFFER
    ========================= */

    socket.on(
      'webrtc-offer',
      ({
        offer,
        bookingId,
      } = {}) => {
        try {
          const roomId =
            `classroom-${bookingId}`;

          if (
            socket.classroomId !==
            roomId
          ) {
            return;
          }

          console.log(
            'Relaying WebRTC offer:',
            socket.id
          );

          socket
            .to(roomId)
            .emit(
              'webrtc-offer',
              {
                offer,
              }
            );
        } catch (error) {
          console.error(
            'WEBRTC OFFER ERROR:',
            error
          );
        }
      }
    );

    /* =========================
       WEBRTC ANSWER
    ========================= */

    socket.on(
      'webrtc-answer',
      ({
        answer,
        bookingId,
      } = {}) => {
        try {
          const roomId =
            `classroom-${bookingId}`;

          if (
            socket.classroomId !==
            roomId
          ) {
            return;
          }

          console.log(
            'Relaying WebRTC answer:',
            socket.id
          );

          socket
            .to(roomId)
            .emit(
              'webrtc-answer',
              {
                answer,
              }
            );
        } catch (error) {
          console.error(
            'WEBRTC ANSWER ERROR:',
            error
          );
        }
      }
    );

    /* =========================
       WEBRTC ICE CANDIDATE
    ========================= */

    socket.on(
      'webrtc-ice-candidate',
      ({
        candidate,
        bookingId,
      } = {}) => {
        try {
          const roomId =
            `classroom-${bookingId}`;

          if (
            socket.classroomId !==
            roomId
          ) {
            return;
          }

          socket
            .to(roomId)
            .emit(
              'webrtc-ice-candidate',
              {
                candidate,
              }
            );
        } catch (error) {
          console.error(
            'WEBRTC ICE ERROR:',
            error
          );
        }
      }
    );

    /* =========================
       LESSON ENDED
    ========================= */

    socket.on(
      'lesson-ended',
      ({
        bookingId,
      } = {}) => {
        try {
          const roomId =
            `classroom-${bookingId}`;

          /*
            Make sure the socket
            is actually inside this
            classroom.
          */

          if (
            socket.classroomId !==
            roomId
          ) {
            console.log(
              'Lesson ended event rejected: socket is not in classroom.'
            );

            return;
          }

          console.log(
            '===================================='
          );

          console.log(
            'LESSON ENDED EVENT'
          );

          console.log(
            'BOOKING ID:',
            bookingId
          );

          console.log(
            'ENDED BY USER:',
            socket.userId
          );

          console.log(
            'ROOM:',
            roomId
          );

          console.log(
            '===================================='
          );

          /*
            Notify the other participant.

            The actual database status is
            changed by:

            PUT /api/bookings/:id/complete
          */

          socket
            .to(roomId)
            .emit(
              'lesson-ended'
            );
        } catch (error) {
          console.error(
            'LESSON ENDED SOCKET ERROR:',
            error
          );
        }
      }
    );

    /* =========================
       LEAVE CLASSROOM
    ========================= */

    socket.on(
      'leave-classroom',
      () => {
        console.log(
          'Leave classroom:',
          socket.id
        );

        leaveClassroom(socket);
      }
    );

    /* =========================
       DISCONNECT
    ========================= */

    socket.on(
      'disconnect',
      () => {
        console.log(
          'Socket disconnected:',
          socket.id
        );

        leaveClassroom(socket);
      }
    );
  }
);

/* =========================
   LEAVE CLASSROOM FUNCTION
========================= */

function leaveClassroom(socket) {
  const roomId =
    socket.classroomId;

  /*
    Socket may not have joined
    a classroom yet.
  */

  if (!roomId) {
    return;
  }

  const room =
    classroomRooms.get(roomId);

  if (room) {
    room.delete(socket.id);

    /*
      Notify remaining participant.
    */

    socket
      .to(roomId)
      .emit('peer-left');

    /*
      Remove empty room.
    */

    if (room.size === 0) {
      classroomRooms.delete(roomId);

      console.log(
        'Classroom room deleted:',
        roomId
      );
    }
  }

  /*
    Remove socket from
    Socket.IO room.
  */

  socket.leave(roomId);

  /*
    Clear classroom information.
  */

  socket.classroomId = null;
  socket.bookingId = null;
  socket.classroomRole = null;
}

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 5001;

server.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);

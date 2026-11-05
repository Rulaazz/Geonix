
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { io } from 'socket.io-client';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useUser } from '../../components/UserContext/UserContext';

import './Classroom.css';

const API_URL = 'http://localhost:5001';
const SOCKET_URL = 'http://localhost:5001';

const rtcConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

function Classroom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] =
    useState('Preparing classroom...');
  const [peerConnected, setPeerConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [endingLesson, setEndingLesson] = useState(false);
  const [lessonEnded, setLessonEnded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const remoteDescriptionSetRef = useRef(false);
  const pendingIceCandidatesRef = useRef([]);
  const mountedRef = useRef(false);

  const userId = user?._id ? String(user._id) : '';

  const instructorId = booking?.instructor?._id
    ? String(booking.instructor._id)
    : '';

  const isInstructor = Boolean(
    userId && instructorId && userId === instructorId
  );

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // Load the booking associated with this classroom.
  useEffect(() => {
    let mounted = true;

    async function loadBooking() {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(
          `${API_URL}/api/bookings/${bookingId}`,
          getAuthConfig()
        );

        if (!mounted) return;

        const loadedBooking = response.data.booking;

        if (!loadedBooking) {
          setBooking(null);
          setError('Could not find this booking.');
          return;
        }

        setBooking(loadedBooking);

        if (loadedBooking.status !== 'confirmed') {
          setError(
            `This lesson is not available for a live classroom. Current status: ${loadedBooking.status}.`
          );
        }
      } catch (err) {
        console.error('LOAD CLASSROOM ERROR:', err);

        if (mounted) {
          setError(
            err.response?.data?.message ||
              'Could not load this lesson.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (bookingId) {
      loadBooking();
    } else {
      setLoading(false);
      setError('A lesson booking ID is missing.');
    }

    return () => {
      mounted = false;
    };
  }, [bookingId, getAuthConfig]);

  const stopLocalMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setMicrophoneReady(false);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }

    setPeerConnected(false);
    remoteDescriptionSetRef.current = false;
    pendingIceCandidatesRef.current = [];
  }, []);

  const cleanupClassroom = useCallback(() => {
    if (socketRef.current) {
      const socket = socketRef.current;

      socketRef.current = null;
      socket.removeAllListeners();
      socket.disconnect();
    }

    closePeerConnection();
    stopLocalMedia();

    hasJoinedRef.current = false;
  }, [closePeerConnection, stopLocalMedia]);

  // Request camera and microphone access and preserve the real error.
  const startCamera = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      setError('');
      setConnectionStatus('Starting camera and microphone...');

      if (!window.isSecureContext) {
        throw new Error(
          'InsecureContextError: Camera and microphone require HTTPS or localhost.'
        );
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          'MediaDevicesUnavailable: This browser does not support camera and microphone access in the current context.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      console.log('LOCAL MEDIA ACQUIRED:', {
        videoTrackFound: Boolean(videoTrack),
        audioTrackFound: Boolean(audioTrack),
        videoEnabled: videoTrack?.enabled,
        audioEnabled: audioTrack?.enabled,
        videoState: videoTrack?.readyState,
        audioState: audioTrack?.readyState,
      });

      setCameraReady(Boolean(videoTrack));
      setMicrophoneReady(Boolean(audioTrack));

      setConnectionStatus('Camera and microphone ready');

      return stream;
    } catch (err) {
      console.error('CAMERA ERROR DETAILS:', {
        name: err?.name || 'UnknownError',
        message: err?.message || String(err),
        secureContext: window.isSecureContext,
        origin: window.location.origin,
      });

      const messages = {
        NotAllowedError:
          'Camera or microphone access was denied. Check your browser and macOS privacy permissions.',
        NotFoundError:
          'No suitable camera or microphone was found.',
        NotReadableError:
          'The camera or microphone may be busy or unavailable. Close other apps using the devices and retry.',
        OverconstrainedError:
          'The camera or microphone cannot satisfy the requested settings.',
        SecurityError:
          'The browser blocked access to the camera or microphone.',
        AbortError:
          'The camera or microphone could not start. Please retry.',
      };

      const errorName = err?.name || 'UnknownError';
      const friendlyMessage =
        messages[errorName] ||
        err?.message ||
        'An unknown camera or microphone error occurred.';

      throw new Error(`${errorName}: ${friendlyMessage}`);
    }
  }, []);

  // Attach the local stream after the video element has rendered.
  useEffect(() => {
    const video = localVideoRef.current;
    const stream = localStreamRef.current;

    if (!video || !stream || !cameraReady || isCameraOff) {
      return;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.play().catch((err) => {
      console.warn('LOCAL VIDEO PLAY ERROR:', err);
    });
  }, [cameraReady, isCameraOff]);

  // Monitor whether the local devices stop unexpectedly.
  useEffect(() => {
    const stream = localStreamRef.current;

    if (!stream) return undefined;

    const handleTrackEnded = (event) => {
      console.warn('LOCAL MEDIA TRACK ENDED:', {
        kind: event.currentTarget?.kind,
        readyState: event.currentTarget?.readyState,
      });

      const currentStream = localStreamRef.current;

      setCameraReady(
        Boolean(
          currentStream?.getVideoTracks().some(
            (track) => track.readyState === 'live'
          )
        )
      );

      setMicrophoneReady(
        Boolean(
          currentStream?.getAudioTracks().some(
            (track) => track.readyState === 'live'
          )
        )
      );
    };

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', handleTrackEnded);
    });

    return () => {
      stream.getTracks().forEach((track) => {
        track.removeEventListener('ended', handleTrackEnded);
      });
    };
  }, [cameraReady, microphoneReady]);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionRef.current = peerConnection;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteStream =
        event.streams?.[0] ||
        new MediaStream([event.track]);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;

        remoteVideoRef.current.play().catch((playError) => {
          console.warn('REMOTE VIDEO PLAY ERROR:', playError);
        });
      }

      setPeerConnected(true);
      setConnectionStatus('Connected');
    };

    peerConnection.onicecandidate = (event) => {
      if (
        !event.candidate ||
        !socketRef.current ||
        !bookingId
      ) {
        return;
      }

      socketRef.current.emit('webrtc-ice-candidate', {
        bookingId,
        candidate: event.candidate,
      });
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      console.log('WEBRTC CONNECTION STATE:', state);

      if (state === 'connected') {
        setPeerConnected(true);
        setConnectionStatus('Connected');
      } else if (state === 'connecting') {
        setConnectionStatus('Connecting to participant...');
      } else if (state === 'disconnected') {
        setPeerConnected(false);
        setConnectionStatus('Participant disconnected.');
      } else if (state === 'failed') {
        setPeerConnected(false);
        setConnectionStatus(
          'Connection failed. Check the network and try rejoining.'
        );
      } else if (state === 'closed') {
        setPeerConnected(false);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        'ICE CONNECTION STATE:',
        peerConnection.iceConnectionState
      );
    };

    peerConnection.onicegatheringstatechange = () => {
      console.log(
        'ICE GATHERING STATE:',
        peerConnection.iceGatheringState
      );
    };

    return peerConnection;
  }, [bookingId]);

  const flushPendingIceCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;

    if (
      !peerConnection ||
      !remoteDescriptionSetRef.current
    ) {
      return;
    }

    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error('ICE CANDIDATE ERROR:', err);
      }
    }
  }, []);

  const createOffer = useCallback(async () => {
    try {
      const peerConnection = createPeerConnection();
      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!socketRef.current?.connected) {
        throw new Error(
          'Socket is not connected; cannot send the WebRTC offer.'
        );
      }

      socketRef.current.emit('webrtc-offer', {
        bookingId,
        offer,
      });

      console.log('WEBRTC OFFER SENT');
    } catch (err) {
      console.error('CREATE OFFER ERROR:', err);
      setConnectionStatus('Could not start the video connection.');
      setError(err.message || 'Could not create the video offer.');
    }
  }, [bookingId, createPeerConnection]);

  const handleOffer = useCallback(
    async (offer) => {
      try {
        const peerConnection = createPeerConnection();

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        remoteDescriptionSetRef.current = true;

        await flushPendingIceCandidates();

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        if (!socketRef.current?.connected) {
          throw new Error(
            'Socket is not connected; cannot send the WebRTC answer.'
          );
        }

        socketRef.current.emit('webrtc-answer', {
          bookingId,
          answer,
        });

        console.log('WEBRTC ANSWER SENT');
      } catch (err) {
        console.error('HANDLE OFFER ERROR:', err);
        setConnectionStatus('Could not establish the video connection.');
        setError(err.message || 'Could not handle the video offer.');
      }
    },
    [bookingId, createPeerConnection, flushPendingIceCandidates]
  );

  const handleAnswer = useCallback(
    async (answer) => {
      try {
        const peerConnection = peerConnectionRef.current;

        if (!peerConnection) {
          console.warn('Received an answer without a peer connection.');
          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        remoteDescriptionSetRef.current = true;

        await flushPendingIceCandidates();

        console.log('WEBRTC ANSWER RECEIVED');
      } catch (err) {
        console.error('HANDLE ANSWER ERROR:', err);
        setError(err.message || 'Could not process the video answer.');
      }
    },
    [flushPendingIceCandidates]
  );

  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) {
        console.warn('ICE candidate received before peer connection.');
        return;
      }

      if (!remoteDescriptionSetRef.current) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      await peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (err) {
      console.error('ADD ICE CANDIDATE ERROR:', err);
    }
  }, []);

  const joinClassroom = useCallback(async () => {
    if (
      hasJoinedRef.current ||
      !booking ||
      booking.status !== 'confirmed'
    ) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setError('Your login session has expired. Please log in again.');
      return;
    }

    hasJoinedRef.current = true;

    try {
      setError('');

      await startCamera();

      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('SOCKET CONNECTED:', socket.id);

        setConnectionStatus('Joining classroom...');

        socket.emit('join-classroom', bookingId);
      });

      socket.on('classroom-joined', () => {
        console.log('CLASSROOM JOINED:', bookingId);

        setConnectionStatus('Waiting for participant...');

        createPeerConnection();
      });

      socket.on('room-ready', ({ initiator } = {}) => {
        console.log('ROOM READY:', { initiator });

        setConnectionStatus('Connecting to participant...');

        createPeerConnection();

        if (initiator) {
          createOffer();
        }
      });

      socket.on('peer-joined', () => {
        console.log('PEER JOINED');

        setConnectionStatus('Participant joined. Connecting...');

        createPeerConnection();
      });

      socket.on('webrtc-offer', ({ offer } = {}) => {
        console.log('WEBRTC OFFER RECEIVED');

        if (offer) {
          handleOffer(offer);
        }
      });

      socket.on('webrtc-answer', ({ answer } = {}) => {
        console.log('WEBRTC ANSWER EVENT RECEIVED');

        if (answer) {
          handleAnswer(answer);
        }
      });

      socket.on(
        'webrtc-ice-candidate',
        ({ candidate } = {}) => {
          if (candidate) {
            handleIceCandidate(candidate);
          }
        }
      );

      socket.on('peer-left', () => {
        console.log('PEER LEFT');

        setPeerConnected(false);
        setConnectionStatus(
          'The other participant left the classroom.'
        );

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }

        closePeerConnection();
      });

      socket.on('classroom-full', () => {
        setError('This classroom already has two participants.');
        setConnectionStatus('Classroom is full.');
        cleanupClassroom();
      });

      socket.on('classroom-error', ({ message } = {}) => {
        const nextError = message || 'Could not join the classroom.';

        console.error('CLASSROOM ERROR:', nextError);

        setError(nextError);
        cleanupClassroom();
      });

      socket.on('connect_error', (socketError) => {
        console.error('SOCKET CONNECTION ERROR:', socketError);

        setError(
          socketError.message ||
            'Could not connect to the classroom server.'
        );

        setConnectionStatus('Connection error');

        cleanupClassroom();
      });

      socket.on('disconnect', (reason) => {
        console.warn('SOCKET DISCONNECTED:', reason);

        if (!lessonEnded && !isLeaving) {
          setConnectionStatus('Disconnected from classroom server.');
        }
      });

      socket.on('lesson-ended', () => {
        setLessonEnded(true);
        setConnectionStatus('Lesson completed');
        cleanupClassroom();
      });
    } catch (err) {
      console.error('JOIN CLASSROOM ERROR:', err);

      setError(
        err.message || 'Could not start the classroom.'
      );

      setConnectionStatus('Could not start classroom');

      cleanupClassroom();
    }
  }, [
    booking,
    bookingId,
    cleanupClassroom,
    closePeerConnection,
    createOffer,
    createPeerConnection,
    handleAnswer,
    handleIceCandidate,
    handleOffer,
    isLeaving,
    lessonEnded,
    startCamera,
  ]);

  // Keep a mounted flag for lifecycle diagnostics.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Automatically join when the booking is confirmed.
  useEffect(() => {
    if (!booking || booking.status !== 'confirmed') {
      return undefined;
    }

    joinClassroom();

    return () => {
      cleanupClassroom();
    };
  }, [booking, joinClassroom, cleanupClassroom]);

  const toggleMute = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];

    if (!tracks.length) {
      setError('No microphone track is available.');
      return;
    }

    const nextMuted = tracks.some((track) => track.enabled);

    tracks.forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];

    if (!tracks.length) {
      setError('No camera track is available.');
      return;
    }

    const nextCameraOff = tracks.some((track) => track.enabled);

    tracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  };

  const leaveClassroom = () => {
    if (isLeaving) return;

    setIsLeaving(true);

    if (socketRef.current) {
      socketRef.current.emit('leave-classroom', { bookingId });
    }

    cleanupClassroom();

    navigate('/my-lessons');
  };

  const endLesson = async () => {
    if (!isInstructor || endingLesson || lessonEnded || !bookingId) {
      return;
    }

    const shouldEnd = window.confirm(
      'Are you sure you want to end this lesson? The lesson will be marked as completed.'
    );

    if (!shouldEnd) return;

    try {
      setEndingLesson(true);
      setError('');

      await axios.put(
        `${API_URL}/api/bookings/${bookingId}/complete`,
        {},
        getAuthConfig()
      );

      setLessonEnded(true);
      setConnectionStatus('Lesson completed');

      if (socketRef.current) {
        socketRef.current.emit('lesson-ended', { bookingId });
      }

      window.setTimeout(() => {
        cleanupClassroom();
      }, 250);
    } catch (err) {
      console.error('END LESSON ERROR:', err);

      setError(
        err.response?.data?.message ||
          'Could not end the lesson.'
      );

      setEndingLesson(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusLabel = () => {
    if (lessonEnded) return 'Completed';
    if (!booking) return 'Loading';

    return booking.status
      ? booking.status.charAt(0).toUpperCase() +
          booking.status.slice(1)
      : 'Unknown';
  };

  if (loading) {
    return (
      <div className="classroom-page">
        <div className="classroom-loading">
          <div className="loading-spinner" />
          <h2>Preparing your classroom...</h2>
          <p>Please wait while we load your lesson.</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="classroom-page">
        <div className="classroom-message">
          <div className="message-icon">⚠️</div>
          <h2>Classroom unavailable</h2>
          <p>{error || 'We could not find this lesson.'}</p>
          <Link to="/my-lessons" className="message-button">
            Back to My Lessons
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status !== 'confirmed' && !lessonEnded) {
    return (
      <div className="classroom-page">
        <main className="classroom-message">
          <div className="message-icon">⏳</div>
          <h2>Classroom not available</h2>
          <p>
            This lesson is currently{' '}
            <strong>{booking.status}</strong>.
          </p>
          <Link to="/my-lessons" className="message-button">
            Back to My Lessons
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="classroom-page">
      <main className="classroom-container">
        <div className="classroom-title-row">
          <div>
            <div className="classroom-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <span>›</span>
              <Link to="/my-lessons">My Lessons</Link>
              <span>›</span>
              <span>Classroom</span>
            </div>

            <h1>
              {isInstructor
                ? 'Teaching Classroom'
                : 'Math Lesson Classroom'}
            </h1>

            <p>{booking.topic || 'Online mathematics lesson'}</p>
          </div>

          <div
            className={`connection-badge ${
              peerConnected ? 'connected' : ''
            }`}
          >
            <span className="connection-dot" />
            {connectionStatus}
          </div>
        </div>

        {error && (
          <div className="classroom-alert" role="alert">
            <span>⚠️</span>

            <div>
              <strong>Classroom message</strong>
              <p>{error}</p>

              {!hasJoinedRef.current &&
                booking.status === 'confirmed' && (
                  <button
                    type="button"
                    className="retry-classroom-button"
                    onClick={joinClassroom}
                  >
                    Try connecting again
                  </button>
                )}
            </div>
          </div>
        )}

        <section className="video-classroom">
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              className={`remote-video ${
                peerConnected ? 'visible' : ''
              }`}
              autoPlay
              playsInline
            />

            {!peerConnected && (
              <div className="remote-placeholder">
                <div className="remote-avatar">
                  {isInstructor ? 'S' : 'I'}
                </div>

                <h2>
                  {isInstructor
                    ? 'Waiting for student'
                    : 'Waiting for instructor'}
                </h2>

                <p>
                  Your participant will appear here when they
                  join the classroom.
                </p>

                <div className="waiting-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {peerConnected && (
              <div className="remote-name-label">
                <span className="remote-status-dot" />
                {isInstructor
                  ? booking.student?.name || 'Student'
                  : booking.instructor?.name || 'Instructor'}
              </div>
            )}

            <div className="local-video-container">
              {cameraReady && !isCameraOff ? (
                <video
                  ref={localVideoRef}
                  className="local-video"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="local-video-placeholder">
                  <span>
                    {isCameraOff ? '📷' : '🎥'}
                  </span>

                  <small>
                    {isCameraOff
                      ? 'Camera off'
                      : 'Camera unavailable'}
                  </small>
                </div>
              )}

              <div className="local-video-label">You</div>
            </div>

            <div className="video-controls">
              <button
                type="button"
                className={`control-button ${
                  isMuted ? 'control-active' : ''
                }`}
                onClick={toggleMute}
                disabled={!microphoneReady}
                title={
                  isMuted
                    ? 'Turn microphone on'
                    : 'Mute microphone'
                }
              >
                <span>{isMuted ? '🔇' : '🎤'}</span>
                <small>{isMuted ? 'Unmute' : 'Mute'}</small>
              </button>

              <button
                type="button"
                className={`control-button ${
                  isCameraOff ? 'control-active' : ''
                }`}
                onClick={toggleCamera}
                disabled={!cameraReady}
                title={
                  isCameraOff
                    ? 'Turn camera on'
                    : 'Turn camera off'
                }
              >
                <span>{isCameraOff ? '📷' : '📹'}</span>
                <small>
                  {isCameraOff ? 'Camera On' : 'Camera'}
                </small>
              </button>

              <button
                type="button"
                className="control-button leave-control-button"
                onClick={leaveClassroom}
                disabled={isLeaving}
              >
                <span>📞</span>
                <small>
                  {isLeaving ? 'Leaving...' : 'Leave'}
                </small>
              </button>

              {isInstructor && (
                <button
                  type="button"
                  className="control-button end-lesson-button"
                  onClick={endLesson}
                  disabled={endingLesson || lessonEnded}
                >
                  <span>{endingLesson ? '⏳' : '✓'}</span>

                  <small>
                    {endingLesson ? 'Ending...' : 'End Lesson'}
                  </small>
                </button>
              )}
            </div>
          </div>

          <div className="classroom-info-grid">
            <div className="classroom-info-card">
              <span className="info-icon">👨‍🏫</span>

              <div>
                <small>Instructor</small>
                <strong>
                  {booking.instructor?.name || 'Instructor'}
                </strong>
              </div>
            </div>

            <div className="classroom-info-card">
              <span className="info-icon">📅</span>

              <div>
                <small>Date</small>
                <strong>{formatDate(booking.date)}</strong>
              </div>
            </div>

            <div className="classroom-info-card">
              <span className="info-icon">🕐</span>

              <div>
                <small>Time</small>
                <strong>
                  {booking.startTime || '—'} –{' '}
                  {booking.endTime || '—'}
                </strong>
              </div>
            </div>

            <div className="classroom-info-card">
              <span className="info-icon">📚</span>

              <div>
                <small>Status</small>
                <strong>{getStatusLabel()}</strong>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="lesson-notes">
              <div className="notes-heading">
                <span>📝</span>
                <strong>Lesson Notes</strong>
              </div>

              <p>{booking.notes}</p>
            </div>
          )}

          <div className="classroom-footer">
            <div className="classroom-footer-status">
              <span
                className={`footer-status-icon ${
                  cameraReady && microphoneReady ? 'ready' : ''
                }`}
              >
                {cameraReady && microphoneReady ? '✓' : '!'}
              </span>

              <div>
                <strong>
                  {cameraReady && microphoneReady
                    ? 'Camera and microphone ready'
                    : 'Camera and microphone setup required'}
                </strong>

                <span>
                  {peerConnected
                    ? 'You are connected to your participant.'
                    : 'Waiting for your participant to join.'}
                </span>
              </div>
            </div>

            <Link
              to="/my-lessons"
              className="back-lessons-button"
            >
              View My Lessons →
            </Link>
          </div>
        </section>
      </main>

      {lessonEnded && (
        <div className="lesson-ended-overlay">
          <div className="lesson-ended-card">
            <div className="lesson-ended-icon">✓</div>

            <h2>Lesson Completed</h2>

            <p>
              {isInstructor
                ? 'This lesson has been successfully completed.'
                : 'The instructor has ended this lesson.'}
            </p>

            <div className="completed-booking-info">
              <strong>{booking.topic || 'Math Lesson'}</strong>
              <span>{formatDate(booking.date)}</span>
              <span>
                {booking.startTime || '—'} –{' '}
                {booking.endTime || '—'}
              </span>
            </div>

            <Link
              to="/my-lessons"
              className="lesson-ended-button"
            >
              Go to My Lessons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classroom;

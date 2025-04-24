import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaUsers, 
  FaMapMarkerAlt,
  FaLock,
  FaGlobe,
  FaGamepad
} from 'react-icons/fa';
import './GameEventCard.css';

const GameEventCard = ({ event, compact = false }) => {
  // Format dates
  const formattedStartDate = format(new Date(event.startTime), 'MMM d, yyyy');
  const formattedStartTime = format(new Date(event.startTime), 'h:mm a');
  const formattedEndTime = format(new Date(event.endTime), 'h:mm a');
  
  // Calculate participants info
  const participantCount = event.participants.length;
  const goingCount = event.participants.filter(p => p.status === 'going').length;
  const maybeCount = event.participants.filter(p => p.status === 'maybe').length;
  const invitedCount = event.participants.filter(p => p.status === 'invited').length;
  
  // Get event type class
  const getEventTypeClass = () => {
    switch(event.eventType) {
      case 'competitive':
        return 'event-type-competitive';
      case 'tournament':
        return 'event-type-tournament';
      case 'practice':
        return 'event-type-practice';
      case 'coaching':
        return 'event-type-coaching';
      default:
        return 'event-type-casual';
    }
  };
  
  // Get event status class
  const getEventStatusClass = () => {
    switch(event.eventStatus) {
      case 'live':
        return 'event-status-live';
      case 'completed':
        return 'event-status-completed';
      case 'cancelled':
        return 'event-status-cancelled';
      case 'postponed':
        return 'event-status-postponed';
      default:
        return 'event-status-scheduled';
    }
  };

  if (compact) {
    // Render compact version
    return (
      <div className={`game-event-card compact ${getEventStatusClass()}`}>
        <div className="event-game-tag">{event.game}</div>
        <div className="event-header">
          <h3 className="event-title">{event.title}</h3>
          <div className={`event-type ${getEventTypeClass()}`}>
            {event.eventType}
          </div>
        </div>
        <div className="event-details">
          <div className="event-detail">
            <FaCalendarAlt /> 
            <span>{formattedStartDate}</span>
          </div>
          <div className="event-detail">
            <FaClock /> 
            <span>{formattedStartTime}</span>
          </div>
          <div className="event-detail">
            <FaUsers />
            <span>{goingCount}/{event.maxParticipants > 0 ? event.maxParticipants : '∞'}</span>
          </div>
        </div>
        <div className="event-card-footer">
          <Link to={`/events/${event._id}`} className="view-event-btn">
            View Details
          </Link>
          {!event.isPublic && <FaLock className="private-icon" title="Private Event" />}
        </div>
      </div>
    );
  }

  // Render full version
  return (
    <div className={`game-event-card ${getEventStatusClass()}`}>
      <div className="event-game-tag">{event.game}</div>
      
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <div className={`event-type ${getEventTypeClass()}`}>
          {event.eventType}
        </div>
      </div>
      
      {event.description && (
        <p className="event-description">{event.description}</p>
      )}
      
      <div className="event-details">
        <div className="event-detail">
          <FaCalendarAlt /> 
          <span>{formattedStartDate}</span>
        </div>
        <div className="event-detail">
          <FaClock /> 
          <span>{formattedStartTime} - {formattedEndTime}</span>
        </div>
        <div className="event-detail">
          <FaGamepad />
          <span>{event.platformDetails?.platform || 'All Platforms'}</span>
        </div>
        <div className="event-detail">
          <FaMapMarkerAlt />
          <span>{event.location}</span>
        </div>
        <div className="event-detail">
          <FaUser />
          <span>
            Hosted by {event.creator.username}
          </span>
        </div>
        <div className="event-detail">
          <FaUsers />
          <span>
            {goingCount} going
            {maybeCount > 0 && `, ${maybeCount} maybe`}
            {invitedCount > 0 && `, ${invitedCount} invited`}
            {event.maxParticipants > 0 && ` (max: ${event.maxParticipants})`}
          </span>
        </div>
        <div className="event-detail">
          <FaGlobe />
          <span>{event.isPublic ? 'Public Event' : 'Private Event'}</span>
        </div>
      </div>
      
      {event.tags && event.tags.length > 0 && (
        <div className="event-tags">
          {event.tags.map((tag, index) => (
            <span key={index} className="event-tag">#{tag}</span>
          ))}
        </div>
      )}
      
      <div className="event-card-footer">
        <Link to={`/events/${event._id}`} className="view-event-btn">
          View Details
        </Link>
        <span className={`event-status ${getEventStatusClass()}`}>
          {event.eventStatus}
        </span>
      </div>
    </div>
  );
};

export default GameEventCard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaGamepad, FaUser, FaClock, FaMapMarkerAlt, FaTag, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './EventForm.css';

const EventForm = ({ editMode = false, eventId = null }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    startTime: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: 'online',
    platformDetails: {
      platform: 'pc',
      serverName: '',
      serverRegion: '',
      lobbyCode: '',
      voiceChat: 'discord',
      voiceChatLink: ''
    },
    venueDetails: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      venueNotes: ''
    },
    isPublic: true,
    maxParticipants: 0,
    minParticipants: 1,
    tags: [],
    eventType: 'casual',
    recurrence: {
      isRecurring: false,
      frequency: 'weekly',
      endDate: null,
      daysOfWeek: []
    },
    notifications: {
      reminders: [
        { time: 60, sent: false }
      ],
      sendReminders: true
    }
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get('/api/games');
        setGames(res.data.data);
      } catch (err) {
        console.error('Error fetching games:', err);
      }
    };

    fetchGames();

    if (editMode && eventId) {
      fetchEventData();
    }
  }, [editMode, eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/events/${eventId}`);
      const eventData = res.data.data;
      
      // Format dates from API
      eventData.startTime = new Date(eventData.startTime);
      eventData.endTime = new Date(eventData.endTime);
      if (eventData.recurrence && eventData.recurrence.endDate) {
        eventData.recurrence.endDate = new Date(eventData.recurrence.endDate);
      }
      
      setFormData(eventData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event details');
      setLoading(false);
      history.push('/events');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleRecurrenceDayToggle = (day) => {
    const daysOfWeek = [...formData.recurrence.daysOfWeek];
    
    if (daysOfWeek.includes(day)) {
      const index = daysOfWeek.indexOf(day);
      daysOfWeek.splice(index, 1);
    } else {
      daysOfWeek.push(day);
    }
    
    setFormData({
      ...formData,
      recurrence: {
        ...formData.recurrence,
        daysOfWeek
      }
    });
  };

  const addReminder = () => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        reminders: [
          ...formData.notifications.reminders,
          { time: 15, sent: false }
        ]
      }
    });
  };

  const updateReminder = (index, value) => {
    const reminders = [...formData.notifications.reminders];
    reminders[index].time = parseInt(value);
    
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        reminders
      }
    });
  };

  const removeReminder = (index) => {
    const reminders = [...formData.notifications.reminders];
    reminders.splice(index, 1);
    
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        reminders
      }
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    
    if (!formData.game.trim()) {
      toast.error('Game is required');
      return false;
    }
    
    if (!formData.startTime || !formData.endTime) {
      toast.error('Start and end times are required');
      return false;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return false;
    }
    
    if (formData.recurrence.isRecurring && formData.recurrence.daysOfWeek.length === 0) {
      toast.error('Please select at least one day for recurring events');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (editMode) {
        await axios.put(`/api/events/${eventId}`, formData);
        toast.success('Event updated successfully');
      } else {
        await axios.post('/api/events', formData);
        toast.success('Event created successfully');
      }
      
      setLoading(false);
      history.push('/events');
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error(err.response?.data?.message || 'Failed to save event');
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">
        {editMode ? 'Edit Event' : 'Create New Event'}
      </h2>
      
      <div className="event-form-progress">
        <div 
          className={`progress-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}
          onClick={() => step > 1 && setStep(1)}
        >
          <div className="step-number">1</div>
          <span className="step-label">Basics</span>
        </div>
        <div 
          className={`progress-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}
          onClick={() => step > 2 && setStep(2)}
        >
          <div className="step-number">2</div>
          <span className="step-label">Details</span>
        </div>
        <div 
          className={`progress-step ${step === 3 ? 'active' : ''}`}
        >
          <div className="step-number">3</div>
          <span className="step-label">Settings</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="event-form">
        {step === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label>
                <FaGamepad /> Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaGamepad /> Game
              </label>
              <input
                type="text"
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                placeholder="Enter game name"
                list="game-list"
                required
              />
              <datalist id="game-list">
                {games.map(game => (
                  <option key={game._id} value={game.name} />
                ))}
              </datalist>
            </div>
            
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Start Date & Time
              </label>
              <DatePicker
                selected={formData.startTime}
                onChange={(date) => handleDateChange(date, 'startTime')}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="date-picker"
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaCalendarAlt /> End Date & Time
              </label>
              <DatePicker
                selected={formData.endTime}
                onChange={(date) => handleDateChange(date, 'endTime')}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={formData.startTime}
                className="date-picker"
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Location Type
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              >
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <FaUser /> Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
              >
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
                <option value="tournament">Tournament</option>
                <option value="practice">Practice</option>
                <option value="coaching">Coaching</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
                rows={5}
              ></textarea>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-next" onClick={nextStep}>
                Next: Details
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            {formData.location === 'online' || formData.location === 'hybrid' ? (
              <div className="form-section">
                <h3>Online Details</h3>
                
                <div className="form-group">
                  <label>Platform</label>
                  <select
                    name="platformDetails.platform"
                    value={formData.platformDetails.platform}
                    onChange={handleInputChange}
                  >
                    <option value="pc">PC</option>
                    <option value="playstation">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="nintendo">Nintendo</option>
                    <option value="mobile">Mobile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Server/Room Name</label>
                  <input
                    type="text"
                    name="platformDetails.serverName"
                    value={formData.platformDetails.serverName}
                    onChange={handleInputChange}
                    placeholder="Server or room name (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Server Region</label>
                  <input
                    type="text"
                    name="platformDetails.serverRegion"
                    value={formData.platformDetails.serverRegion}
                    onChange={handleInputChange}
                    placeholder="Server region (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Lobby Code</label>
                  <input
                    type="text"
                    name="platformDetails.lobbyCode"
                    value={formData.platformDetails.lobbyCode}
                    onChange={handleInputChange}
                    placeholder="Lobby code (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Voice Chat Platform</label>
                  <select
                    name="platformDetails.voiceChat"
                    value={formData.platformDetails.voiceChat}
                    onChange={handleInputChange}
                  >
                    <option value="discord">Discord</option>
                    <option value="in-game">In-game Voice</option>
                    <option value="teamspeak">TeamSpeak</option>
                    <option value="mumble">Mumble</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Voice Chat Link/ID</label>
                  <input
                    type="text"
                    name="platformDetails.voiceChatLink"
                    value={formData.platformDetails.voiceChatLink}
                    onChange={handleInputChange}
                    placeholder="Discord invite, channel link, etc. (optional)"
                  />
                </div>
              </div>
            ) : null}
            
            {formData.location === 'in-person' || formData.location === 'hybrid' ? (
              <div className="form-section">
                <h3>Venue Details</h3>
                
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="venueDetails.address"
                    value={formData.venueDetails.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="venueDetails.city"
                      value={formData.venueDetails.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>State/Province</label>
                    <input
                      type="text"
                      name="venueDetails.state"
                      value={formData.venueDetails.state}
                      onChange={handleInputChange}
                      placeholder="State/Province"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="venueDetails.country"
                      value={formData.venueDetails.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>ZIP/Postal Code</label>
                    <input
                      type="text"
                      name="venueDetails.zipCode"
                      value={formData.venueDetails.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP/Postal code"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Additional Venue Information</label>
                  <textarea
                    name="venueDetails.venueNotes"
                    value={formData.venueDetails.venueNotes}
                    onChange={handleInputChange}
                    placeholder="Parking info, entrance details, etc."
                    rows={3}
                  ></textarea>
                </div>
              </div>
            ) : null}
            
            <div className="form-section">
              <h3>Tags</h3>
              <div className="form-group">
                <label>
                  <FaTag /> Add Tags
                </label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="tag-add-btn"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="tags-container">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="tag">
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="tag-remove"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-back" onClick={prevStep}>
                Back: Basics
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Next: Settings
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <div className="form-section">
              <h3>Participation</h3>
              
              <div className="form-group">
                <label>
                  <FaUsers /> Maximum Participants
                </label>
                <div className="input-description">
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="0"
                  />
                  <span className="input-help">
                    (0 = unlimited)
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  <FaUsers /> Minimum Participants
                </label>
                <input
                  type="number"
                  name="minParticipants"
                  value={formData.minParticipants}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Make this event public
                </label>
                <div className="input-help">
                  {formData.isPublic 
                    ? 'Anyone can find and join this event' 
                    : 'Only invited users or your friends can join'}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Recurrence</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="recurrence.isRecurring"
                    checked={formData.recurrence.isRecurring}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Repeat this event
                </label>
              </div>
              
              {formData.recurrence.isRecurring && (
                <>
                  <div className="form-group">
                    <label>
                      <FaClock /> Frequency
                    </label>
                    <select
                      name="recurrence.frequency"
                      value={formData.recurrence.frequency}
                      onChange={handleInputChange}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  {(formData.recurrence.frequency === 'weekly' || 
                    formData.recurrence.frequency === 'biweekly') && (
                    <div className="form-group">
                      <label>Days of Week</label>
                      <div className="days-of-week">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                          <div 
                            key={day} 
                            className={`day-button ${formData.recurrence.daysOfWeek.includes(index) ? 'selected' : ''}`}
                            onClick={() => handleRecurrenceDayToggle(index)}
                          >
                            {day.substring(0, 3)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>
                      <FaCalendarAlt /> End Date (optional)
                    </label>
                    <DatePicker
                      selected={formData.recurrence.endDate}
                      onChange={(date) => {
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence,
                            endDate: date
                          }
                        });
                      }}
                      minDate={formData.startTime}
                      isClearable
                      placeholderText="No end date"
                      className="date-picker"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="form-section">
              <h3>Reminders</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="notifications.sendReminders"
                    checked={formData.notifications.sendReminders}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Send reminders to participants
                </label>
              </div>
              
              {formData.notifications.sendReminders && (
                <div className="form-group">
                  <label>Reminder Times (minutes before event)</label>
                  
                  {formData.notifications.reminders.map((reminder, index) => (
                    <div key={index} className="reminder-input">
                      <input
                        type="number"
                        value={reminder.time}
                        onChange={(e) => updateReminder(index, e.target.value)}
                        min="5"
                      />
                      <span className="input-help">minutes before</span>
                      <button
                        type="button"
                        onClick={() => removeReminder(index)}
                        className="reminder-remove"
                        disabled={formData.notifications.reminders.length <= 1}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addReminder}
                    className="btn-add-reminder"
                  >
                    + Add Another Reminder
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-back" onClick={prevStep}>
                Back: Details
              </button>
              <button type="submit" className="btn-submit">
                {editMode ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventForm;
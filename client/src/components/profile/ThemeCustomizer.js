import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette, 
  faFont, 
  faCode, 
  faBorderStyle, 
  faSpinner,
  faMagic,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import './ThemeCustomizer.css';

const ThemeCustomizer = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState({
    primaryColor: '#6C5CE7',
    secondaryColor: '#00F260',
    bgColor: '#191A2A',
    accentColor: '#FD7272',
    font: 'default',
    uiStyle: 'neon',
    darkMode: true,
    customCss: '',
    borderStyle: 'glowing',
    animationLevel: 'moderate'
  });
  
  // Initialize theme state with user's theme settings
  useEffect(() => {
    if (auth.user && auth.user.theme) {
      setTheme(auth.user.theme);
    }
  }, [auth.user]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTheme({
      ...theme,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Apply theme changes in real-time for preview
  useEffect(() => {
    applyThemePreview(theme);
  }, [theme]);
  
  const applyThemePreview = (themeSettings) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--secondary-color', themeSettings.secondaryColor);
    root.style.setProperty('--bg-color', themeSettings.bgColor);
    root.style.setProperty('--accent-color', themeSettings.accentColor);
    
    // Apply font
    let fontFamily = 'Poppins, sans-serif'; // Default
    switch (themeSettings.font) {
      case 'roboto':
        fontFamily = 'Roboto, sans-serif';
        break;
      case 'poppins':
        fontFamily = 'Poppins, sans-serif';
        break;
      case 'montserrat':
        fontFamily = 'Montserrat, sans-serif';
        break;
      case 'sourcecode':
        fontFamily = 'Source Code Pro, monospace';
        break;
      case 'pressstart':
        fontFamily = '"Press Start 2P", cursive';
        break;
      case 'orbitron':
        fontFamily = 'Orbitron, sans-serif';
        break;
      default:
        fontFamily = 'Poppins, sans-serif';
    }
    root.style.setProperty('--font-family', fontFamily);
    
    // Apply UI style classes
    document.body.classList.remove(
      'ui-default', 
      'ui-neon', 
      'ui-cyberpunk', 
      'ui-retro', 
      'ui-minimal', 
      'ui-futuristic'
    );
    document.body.classList.add(`ui-${themeSettings.uiStyle}`);
    
    // Apply border style classes
    document.body.classList.remove(
      'border-default', 
      'border-rounded', 
      'border-sharp', 
      'border-glowing', 
      'border-pixelated'
    );
    document.body.classList.add(`border-${themeSettings.borderStyle}`);
    
    // Apply animation level classes
    document.body.classList.remove(
      'animation-none', 
      'animation-minimal', 
      'animation-moderate', 
      'animation-high'
    );
    document.body.classList.add(`animation-${themeSettings.animationLevel}`);
    
    // Apply dark/light mode
    if (themeSettings.darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    
    // Apply custom CSS if provided
    let customStyleTag = document.getElementById('theme-custom-css');
    if (!customStyleTag) {
      customStyleTag = document.createElement('style');
      customStyleTag.id = 'theme-custom-css';
      document.head.appendChild(customStyleTag);
    }
    customStyleTag.innerHTML = themeSettings.customCss || '';
  };
  
  const handleResetTheme = () => {
    setTheme({
      primaryColor: '#6C5CE7',
      secondaryColor: '#00F260',
      bgColor: '#191A2A',
      accentColor: '#FD7272',
      font: 'default',
      uiStyle: 'neon',
      darkMode: true,
      customCss: '',
      borderStyle: 'glowing',
      animationLevel: 'moderate'
    });
    toast.info('Theme reset to defaults');
  };
  
  const handleSaveTheme = async () => {
    try {
      setLoading(true);
      const res = await axios.put('/api/profile/theme', theme);
      
      // Update user in Redux
      dispatch({
        type: 'UPDATE_USER',
        payload: { ...auth.user, theme: res.data.data }
      });
      
      toast.success('Theme saved successfully');
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save theme');
      setLoading(false);
    }
  };
  
  const applyPresetTheme = (preset) => {
    switch (preset) {
      case 'cyberpunk':
        setTheme({
          primaryColor: '#F500F7',
          secondaryColor: '#00FFFF',
          bgColor: '#0A0A0A',
          accentColor: '#FFFF00',
          font: 'orbitron',
          uiStyle: 'cyberpunk',
          darkMode: true,
          customCss: '',
          borderStyle: 'sharp',
          animationLevel: 'high'
        });
        break;
      case 'retro':
        setTheme({
          primaryColor: '#FF5A5F',
          secondaryColor: '#8A4FFF',
          bgColor: '#222034',
          accentColor: '#F9C80E',
          font: 'pressstart',
          uiStyle: 'retro',
          darkMode: true,
          customCss: '',
          borderStyle: 'pixelated',
          animationLevel: 'minimal'
        });
        break;
      case 'minimal':
        setTheme({
          primaryColor: '#3A506B',
          secondaryColor: '#5BC0BE',
          bgColor: '#1C1C1C',
          accentColor: '#6FFFE9',
          font: 'montserrat',
          uiStyle: 'minimal',
          darkMode: true,
          customCss: '',
          borderStyle: 'rounded',
          animationLevel: 'none'
        });
        break;
      case 'neon':
        setTheme({
          primaryColor: '#6C5CE7',
          secondaryColor: '#00F260',
          bgColor: '#191A2A',
          accentColor: '#FD7272',
          font: 'poppins',
          uiStyle: 'neon',
          darkMode: true,
          customCss: '',
          borderStyle: 'glowing',
          animationLevel: 'moderate'
        });
        break;
      case 'futuristic':
        setTheme({
          primaryColor: '#3498DB',
          secondaryColor: '#2ECC71',
          bgColor: '#1E293B',
          accentColor: '#E67E22',
          font: 'orbitron',
          uiStyle: 'futuristic',
          darkMode: true,
          customCss: '',
          borderStyle: 'glowing',
          animationLevel: 'high'
        });
        break;
      default:
        // Default theme
        handleResetTheme();
    }
    
    toast.info(`${preset.charAt(0).toUpperCase() + preset.slice(1)} theme applied`);
  };
  
  return (
    <div className="theme-customizer">
      <h2 className="theme-customizer-title">
        <FontAwesomeIcon icon={faPalette} /> Theme Customizer
      </h2>
      
      <div className="theme-presets">
        <h3>Quick Presets</h3>
        <div className="preset-buttons">
          <button
            className="preset-button preset-neon"
            onClick={() => applyPresetTheme('neon')}
            title="Neon Theme"
          >
            Neon
          </button>
          <button
            className="preset-button preset-cyberpunk"
            onClick={() => applyPresetTheme('cyberpunk')}
            title="Cyberpunk Theme"
          >
            Cyberpunk
          </button>
          <button
            className="preset-button preset-retro"
            onClick={() => applyPresetTheme('retro')}
            title="Retro Theme"
          >
            Retro
          </button>
          <button
            className="preset-button preset-minimal"
            onClick={() => applyPresetTheme('minimal')}
            title="Minimal Theme"
          >
            Minimal
          </button>
          <button
            className="preset-button preset-futuristic"
            onClick={() => applyPresetTheme('futuristic')}
            title="Futuristic Theme"
          >
            Futuristic
          </button>
        </div>
      </div>
      
      <div className="customizer-section">
        <h3>
          <FontAwesomeIcon icon={faPalette} /> Colors
        </h3>
        <div className="color-pickers">
          <div className="color-picker">
            <label htmlFor="primaryColor">Primary Color</label>
            <div className="color-input-container">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={theme.primaryColor}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={handleInputChange}
                name="primaryColor"
                className="color-text-input"
              />
            </div>
          </div>
          
          <div className="color-picker">
            <label htmlFor="secondaryColor">Secondary Color</label>
            <div className="color-input-container">
              <input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={theme.secondaryColor}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={handleInputChange}
                name="secondaryColor"
                className="color-text-input"
              />
            </div>
          </div>
          
          <div className="color-picker">
            <label htmlFor="bgColor">Background Color</label>
            <div className="color-input-container">
              <input
                type="color"
                id="bgColor"
                name="bgColor"
                value={theme.bgColor}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={theme.bgColor}
                onChange={handleInputChange}
                name="bgColor"
                className="color-text-input"
              />
            </div>
          </div>
          
          <div className="color-picker">
            <label htmlFor="accentColor">Accent Color</label>
            <div className="color-input-container">
              <input
                type="color"
                id="accentColor"
                name="accentColor"
                value={theme.accentColor}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={handleInputChange}
                name="accentColor"
                className="color-text-input"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="customizer-section">
        <h3>
          <FontAwesomeIcon icon={faFont} /> Typography & Style
        </h3>
        <div className="form-group">
          <label htmlFor="font">Font Family</label>
          <select
            id="font"
            name="font"
            value={theme.font}
            onChange={handleInputChange}
          >
            <option value="default">Default</option>
            <option value="roboto">Roboto</option>
            <option value="poppins">Poppins</option>
            <option value="montserrat">Montserrat</option>
            <option value="sourcecode">Source Code Pro</option>
            <option value="pressstart">Press Start 2P</option>
            <option value="orbitron">Orbitron</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="uiStyle">UI Style</label>
          <select
            id="uiStyle"
            name="uiStyle"
            value={theme.uiStyle}
            onChange={handleInputChange}
          >
            <option value="default">Default</option>
            <option value="neon">Neon</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="retro">Retro</option>
            <option value="minimal">Minimal</option>
            <option value="futuristic">Futuristic</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="borderStyle">Border Style</label>
          <select
            id="borderStyle"
            name="borderStyle"
            value={theme.borderStyle}
            onChange={handleInputChange}
          >
            <option value="default">Default</option>
            <option value="rounded">Rounded</option>
            <option value="sharp">Sharp</option>
            <option value="glowing">Glowing</option>
            <option value="pixelated">Pixelated</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="animationLevel">Animation Level</label>
          <select
            id="animationLevel"
            name="animationLevel"
            value={theme.animationLevel}
            onChange={handleInputChange}
          >
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="darkMode"
              checked={theme.darkMode}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Dark Mode
          </label>
        </div>
      </div>
      
      <div className="customizer-section">
        <h3>
          <FontAwesomeIcon icon={faCode} /> Custom CSS
        </h3>
        <div className="form-group">
          <label htmlFor="customCss">Custom CSS (Advanced)</label>
          <textarea
            id="customCss"
            name="customCss"
            value={theme.customCss}
            onChange={handleInputChange}
            placeholder="Add your custom CSS here..."
            rows={5}
          />
          <div className="form-help">
            Use with caution. Custom CSS overrides other settings.
          </div>
        </div>
      </div>
      
      <div className="theme-customizer-actions">
        <button
          className="reset-button"
          onClick={handleResetTheme}
          title="Reset to default theme"
        >
          Reset to Default
        </button>
        <button
          className="save-button"
          onClick={handleSaveTheme}
          disabled={loading}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} /> Save Theme
            </>
          )}
        </button>
      </div>
      
      <div className="theme-preview">
        <h3>Live Preview</h3>
        <div className="preview-components">
          <div className="preview-card">
            <h4>Card Title</h4>
            <p>This is how content will look with your current theme settings.</p>
            <button className="preview-button primary">Primary Button</button>
          </div>
          <div className="preview-form">
            <div className="preview-form-group">
              <label>Input Field</label>
              <input type="text" placeholder="Sample input" />
            </div>
            <div className="preview-form-group">
              <label>Select Menu</label>
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <button className="preview-button secondary">Secondary Button</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
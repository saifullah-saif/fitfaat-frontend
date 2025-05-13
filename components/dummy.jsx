import { useEffect, useState } from 'react';
import axios from 'axios';

const OnboardingQuiz = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    target_weight: '',
    activity_level: '',
    goal_type: '',
    daily_calorie_target: '',
    dietary_preferences: '',
    allergies: '',
    medical_conditions: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Fetch user's health profile data on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/onboarding', { withCredentials: true });
        if (response.data.profile) {
          setFormData(response.data.profile);  // Populate form with saved profile data
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error fetching profile data.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes and track if any field was modified
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      // Check if form has been changed
      setIsFormChanged(JSON.stringify(updatedData) !== JSON.stringify(profile));
      return updatedData;
    });
  };

  // Handle form submission (update the profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormChanged) {
      alert('No changes to update');
      return;
    }
    try {
      const response = await axios.post('/api/onboarding', formData, { withCredentials: true });
      alert(response.data.message);
    } catch (err) {
      console.error('Error submitting data:', err);
      alert('Failed to submit data');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Onboarding Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Height (cm):</label>
          <input
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter your height"
          />
        </div>

        <div className="form-group">
          <label>Weight (kg):</label>
          <input
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter your weight"
          />
        </div>

        <div className="form-group">
          <label>Target Weight (kg):</label>
          <input
            type="number"
            name="target_weight"
            value={formData.target_weight || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter your target weight"
          />
        </div>

        <div className="form-group">
          <label>Activity Level:</label>
          <select
            name="activity_level"
            value={formData.activity_level || ''}
            onChange={handleChange}
            disabled={!profile}
          >
            <option value="">Select activity level</option>
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly active">Lightly active</option>
            <option value="Moderately active">Moderately active</option>
            <option value="Very active">Very active</option>
          </select>
        </div>

        <div className="form-group">
          <label>Goal Type:</label>
          <select
            name="goal_type"
            value={formData.goal_type || ''}
            onChange={handleChange}
            disabled={!profile}
          >
            <option value="">Select goal</option>
            <option value="Weight loss">Weight loss</option>
            <option value="Weight maintenance">Weight maintenance</option>
            <option value="Muscle gain">Muscle gain</option>
          </select>
        </div>

        <div className="form-group">
          <label>Daily Calorie Target:</label>
          <input
            type="number"
            name="daily_calorie_target"
            value={formData.daily_calorie_target || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter your daily calorie target"
          />
        </div>

        <div className="form-group">
          <label>Dietary Preferences:</label>
          <input
            type="text"
            name="dietary_preferences"
            value={formData.dietary_preferences || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter your dietary preferences (e.g., vegetarian)"
          />
        </div>

        <div className="form-group">
          <label>Allergies:</label>
          <input
            type="text"
            name="allergies"
            value={formData.allergies || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter any allergies"
          />
        </div>

        <div className="form-group">
          <label>Medical Conditions:</label>
          <input
            type="text"
            name="medical_conditions"
            value={formData.medical_conditions || ''}
            onChange={handleChange}
            disabled={!profile}
            placeholder="Enter any medical conditions"
          />
        </div>

        <div className="form-group">
          <button type="submit" disabled={!isFormChanged}>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingQuiz;

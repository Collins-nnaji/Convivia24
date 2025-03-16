import axios from 'axios';

const API_ENDPOINT = 'https://convivia24ai.openai.azure.com/';
const API_KEY = '3SgC8UUeEaDXuo14repegc5wvoAz4aaTfeTtYIqxfzauJSRDbGyfJQQJ99BCACYeBjFXJ3w3AAAAACOGI0tT';
const API_VERSION = '2024-07-18';
const DEPLOYMENT_NAME = 'gpt-4o-mini';

/**
 * Service for interacting with Azure OpenAI API
 */
const aiService = {
  /**
   * Generate event recommendations based on user inputs
   * @param {Object} eventDetails - Details about the event
   * @returns {Promise<Object>} - AI generated recommendations
   */
  generateEventRecommendations: async (eventDetails) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        data: {
          messages: [
            {
              role: 'system',
              content: 'You are an expert event planner assistant for Convivia24, a platform specializing in celebration planning and liquor supply. Provide detailed, creative, and practical recommendations for events based on the information provided. Focus on celebration themes, decoration ideas, drink recommendations, entertainment suggestions, and any other relevant aspects of event planning. Keep responses concise but comprehensive.'
            },
            {
              role: 'user',
              content: `I'm planning a ${eventDetails.eventType} on ${eventDetails.eventDate} at ${eventDetails.location} with approximately ${eventDetails.guests} guests. 
              Additional requirements: ${eventDetails.requirements || 'None specified'}. 
              Preferred liquor supplier: ${eventDetails.supplier || 'No preference'}.
              Please provide recommendations for my event including theme ideas, decoration suggestions, drink menu recommendations, entertainment options, and any other tips to make this celebration special.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      throw new Error('Failed to generate recommendations. Please try again later.');
    }
  },

  /**
   * Generate a customized drink menu based on event details
   * @param {Object} eventDetails - Details about the event
   * @returns {Promise<Object>} - AI generated drink menu
   */
  generateDrinkMenu: async (eventDetails) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        data: {
          messages: [
            {
              role: 'system',
              content: 'You are a professional mixologist and beverage consultant for Convivia24, a platform specializing in celebration planning and liquor supply. Create a customized drink menu with both alcoholic and non-alcoholic options based on the event details provided. Include signature cocktails, wine/beer recommendations, and non-alcoholic options. Format the response as a structured menu with sections.'
            },
            {
              role: 'user',
              content: `I need a drink menu for a ${eventDetails.eventType} on ${eventDetails.eventDate} with approximately ${eventDetails.guests} guests. 
              Additional context: ${eventDetails.requirements || 'None specified'}.
              Preferred liquor supplier: ${eventDetails.supplier || 'No preference'}.
              Please create a customized drink menu with signature cocktails, wine/beer recommendations, and non-alcoholic options that would be appropriate for this event.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating drink menu:', error);
      throw new Error('Failed to generate drink menu. Please try again later.');
    }
  },

  /**
   * Generate budget estimation based on event details
   * @param {Object} eventDetails - Details about the event
   * @returns {Promise<Object>} - AI generated budget estimation
   */
  generateBudgetEstimation: async (eventDetails) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        data: {
          messages: [
            {
              role: 'system',
              content: 'You are a financial advisor specializing in event planning for Convivia24. Provide a detailed budget breakdown for events based on the information provided. Include estimates for venue, catering, beverages, decorations, entertainment, and other relevant categories. Provide ranges where appropriate and tips for cost-saving. Format the response as a structured budget with categories and estimated costs.'
            },
            {
              role: 'user',
              content: `I need a budget estimation for a ${eventDetails.eventType} on ${eventDetails.eventDate} at ${eventDetails.location} with approximately ${eventDetails.guests} guests. 
              Additional requirements: ${eventDetails.requirements || 'None specified'}.
              Preferred liquor supplier: ${eventDetails.supplier || 'No preference'}.
              Please provide a detailed budget breakdown with estimates for all major categories and some cost-saving tips.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating budget estimation:', error);
      throw new Error('Failed to generate budget estimation. Please try again later.');
    }
  }
};

export default aiService; 
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ResumeParser {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async extractText(file, fileType) {
        return new Promise((resolve, reject) => {
            try {
                switch (fileType) {
                    case 'pdf':
                        require('pdf-parse')(file)
                            .then(data => resolve(data.text))
                            .catch(reject);
                        break;
                    case 'docx':
                        require('mammoth').extractRawText({ buffer: file })
                            .then(result => resolve(result.value))
                            .catch(reject);
                        break;
                    case 'doc':
                        require('textract').fromBufferWithMime('application/msword', file, (err, text) => {
                            if (err) reject(err);
                            else resolve(text);
                        });
                        break;
                    default:
                        reject(new Error('Unsupported file type'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async parseResumeText(text) {
        try {
            const prompt = `Analyze this resume and return a JSON object with the exact structure below. 
            DO NOT include any extra quotes or special characters in the text values.
            
            Required structure:
            {
                "personalInfo": {
                    "name": "full name",
                    "location": "complete address"
                },
                "contact": {
                    "email": "email",
                    "phone": "phone"
                },
                "education": [
                    {
                        "institution": "school name",
                        "degree": "degree",
                        "fieldOfStudy": "major",
                        "startDate": "YYYY-MM",
                        "endDate": "YYYY-MM"
                    }
                ],
                "experience": [
                    {
                        "company": "company name",
                        "title": "job title",
                        "startDate": "YYYY-MM",
                        "endDate": "YYYY-MM",
                        "responsibilities": ["responsibility 1", "responsibility 2"]
                    }
                ],
                "skills": ["skill1", "skill2"]
            }

            Resume text:
            ${text}

            Important:
            1. Use the exact JSON structure with no extra text before or after.
            2. Ensure dates are formatted as YYYY-MM.
            3. Remove redundant punctuation or symbols.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let parsedText = response.text();


            // Extract JSON strictly from response
            parsedText = this.extractJson(parsedText);

            try {
                const parsedData = JSON.parse(parsedText);
                return this.validateAndStructureData(parsedData);
            } catch (jsonError) {
                console.error('Initial JSON parsing failed, attempting recovery...');
                parsedText = this.cleanJsonResponse(parsedText);
                try {
                    const parsedData = JSON.parse(parsedText);
                    return this.validateAndStructureData(parsedData);
                } catch (finalError) {
                    console.error('Final parsing attempt failed:', finalError);
                    throw new Error('Failed to parse resume data: Invalid JSON format');
                }
            }
        } catch (error) {
            console.error('Error in resume parsing:', error);
            throw error;
        }
    }

    extractJson(text) {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0].trim() : '{}'; // Default to empty JSON if extraction fails
    }

    cleanJsonResponse(text) {
        return text
            .replace(/\n/g, ' ') // Remove newlines
            .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,])\s*([a-zA-Z])/g, '$1"$2') // Add quotes to keys
            .replace(/:\s*"([^"]*),([^"]*)"/g, ':"$1$2"') // Fix split quotes
            .replace(/""([^"]*)""/g, '"$1"') // Fix double quotes
            .replace(/,\s*,/g, ',') // Remove duplicate commas
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    validateAndStructureData(data) {
        return {
            personalInfo: {
                name: this.cleanTextField(data.personalInfo?.name),
                location: this.cleanTextField(data.personalInfo?.location)
            },
            contact: {
                email: this.cleanTextField(data.contact?.email),
                phone: this.cleanTextField(data.contact?.phone)
            },
            education: Array.isArray(data.education) ? data.education.map(edu => ({
                institution: this.cleanTextField(edu.institution),
                degree: this.cleanTextField(edu.degree),
                fieldOfStudy: this.cleanTextField(edu.fieldOfStudy),
                startDate: this.formatDate(edu.startDate),
                endDate: this.formatDate(edu.endDate)
            })) : [],
            experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
                company: this.cleanTextField(exp.company),
                title: this.cleanTextField(exp.title),
                startDate: this.formatDate(exp.startDate),
                endDate: this.formatDate(exp.endDate),
                responsibilities: Array.isArray(exp.responsibilities)
                    ? exp.responsibilities.map(r => this.cleanTextField(r))
                    : []
            })) : [],
            skills: Array.isArray(data.skills)
                ? data.skills.map(skill => this.cleanTextField(skill))
                : []
        };
    }

    cleanTextField(text) {
        if (!text) return '';
        return text
            .replace(/["'`]/g, '') // Remove smart quotes, apostrophes, and backticks
            .replace(/\s+/g, ' ') // Normalize spaces
            .replace(/,+/g, ',') // Fix multiple commas
            .replace(/null|undefined/gi, '') // Remove "null" and "undefined"
            .replace(/\\/g, '') // Remove backslashes
            .trim();
    }

    formatDate(date) {
        if (!date) return '';
        const match = date.match(/\d{4}[-/]\d{1,2}/);
        return match ? match[0].replace('/', '-') : '';
    }
}

module.exports = ResumeParser;

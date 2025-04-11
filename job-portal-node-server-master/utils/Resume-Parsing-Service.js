const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');
const natural = require('natural');
const compromise = require('compromise');

class ResumeParser {
    static async extractText(file, fileType) {
        return new Promise((resolve, reject) => {
            try {
                switch (fileType) {
                    case 'pdf':
                        pdf(file).then(data => resolve(data.text)).catch(reject);
                        break;
                    case 'docx':
                        mammoth.extractRawText({ buffer: file })
                            .then(result => resolve(result.value))
                            .catch(reject);
                        break;
                    case 'doc':
                        textract.fromBufferWithMime('application/msword', file, (err, text) => {
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

    static cleanText(text) {
        // Remove extra spaces between characters (like "S O F T W A R E")
        return text.replace(/(?<=\w)\s+(?=\w)/g, '');
    }

    static async parseResumeText(text) {
        // Clean the text first
        text = this.cleanText(text);
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        const parsedData = {
            contact: { 
                email: null, 
                phone: null,
                links: []
            },
            personalInfo: { 
                name: null, 
                location: null,
                summary: null
            },
            education: [],
            experience: [],
            skills: [],
            projects: []
        };

        // Extract email
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const emails = text.match(emailRegex);
        if (emails) {
            parsedData.contact.email = emails[0];
        }

        // Extract phone
        const phoneRegex = /(?:\+?91)?[- ]?(\d{10})/g;
        const phones = text.match(phoneRegex);
        if (phones) {
            parsedData.contact.phone = phones[0].replace(/\D/g, '');
        }

        // Extract links
        const linkRegex = /https?:\/\/[^\s]+/g;
        const links = text.match(linkRegex);
        if (links) {
            parsedData.contact.links = links;
        }

        // Extract name
        for (const line of lines) {
            if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line) && 
                !line.toLowerCase().includes('college')) {
                parsedData.personalInfo.name = line;
                break;
            }
        }

        // Extract location
        const locationRegex = /([^,]+,[^,]+(?:, Bengaluru|, bangalore))/i;
        for (const line of lines) {
            const match = line.match(locationRegex);
            if (match && !line.includes('@') && !line.includes('college')) {
                parsedData.personalInfo.location = match[0];
                break;
            }
        }

        // Extract summary
        const summaryEndIndex = text.toLowerCase().indexOf('experience');
        if (summaryEndIndex > 0) {
            const possibleSummary = text.substring(0, summaryEndIndex).trim();
            if (possibleSummary.length > 50) {
                parsedData.personalInfo.summary = possibleSummary;
            }
        }

        // Extract experience
        const experienceSection = this.extractSection(text, 'EXPERIENCE', 'PROJECTS');
        if (experienceSection) {
            const experiences = experienceSection.split(/(?=\b[A-Z][a-z]+\b\s+(?:Developer|Engineer))/g)
                .filter(exp => exp.trim().length > 0)
                .map(exp => {
                    const lines = exp.split('\n');
                    const titleLine = lines[0];
                    return {
                        company: titleLine.split(' ')[0],
                        title: titleLine,
                        details: lines.slice(1).join(' ').trim()
                    };
                });
            parsedData.experience = experiences;
        }

        // Extract projects
        const projectsSection = this.extractSection(text, 'PROJECTS', 'TECHNOLOGY');
        if (projectsSection) {
            parsedData.projects = projectsSection
                .split(/(?=[A-Z][a-z]+ed\b|[A-Z][a-z]+ed\s)/g)
                .filter(project => project.trim().length > 0)
                .map(project => project.trim());
        }

        // Extract skills
        const skillsSection = this.extractSection(text, 'COMPETENCIES', 'EDUCATION');
        if (skillsSection) {
            parsedData.skills = skillsSection
                .split(/[,\n]/)
                .map(skill => skill.trim())
                .filter(skill => 
                    skill.length > 0 && 
                    !skill.includes(':') && 
                    !skill.toLowerCase().includes('competencies')
                );
        }

        // Extract education
        const educationSection = this.extractSection(text, 'EDUCATION', null);
        if (educationSection) {
            const eduInfo = educationSection.match(/Bachelor[^,]+,[^,]+,\s*[\d\s-]+/g);
            if (eduInfo) {
                parsedData.education = eduInfo.map(edu => edu.trim());
            }
        }

        return parsedData;
    }

    static extractSection(text, startMarker, endMarker) {
        const cleanedText = text.replace(/\s+/g, ' ');
        const startIndex = cleanedText.indexOf(startMarker.toUpperCase());
        if (startIndex === -1) return null;

        let endIndex;
        if (endMarker) {
            endIndex = cleanedText.indexOf(endMarker.toUpperCase(), startIndex);
            if (endIndex === -1) endIndex = cleanedText.length;
        } else {
            endIndex = cleanedText.length;
        }

        return cleanedText.substring(startIndex, endIndex)
            .replace(startMarker.toUpperCase(), '')
            .trim();
    }
}

module.exports = ResumeParser;
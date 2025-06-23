import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Wand2, 
  Image, 
  Settings, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  Video, 
  Palette, 
  FolderPlus, 
  Database, 
  Heart,
  Camera,
  Film,
  Layers,
  BookOpen,
  Info
} from 'lucide-react';

const AITrailerAutomationPro = () => {
  const [script, setScript] = useState('');
  const [storyBible, setStoryBible] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedSubgenre, setSelectedSubgenre] = useState('contemporary');
  const [generatedContent, setGeneratedContent] = useState({
    characterPrompts: [],
    environmentPrompts: [],
    shotPrompts: [],
    videoPrompts: [],
    runwayReferences: [],
    folderStructure: null,
    notionTemplate: null
  });
  const [selectedPhase, setSelectedPhase] = useState('project_setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const fileInputRef = useRef(null);

  const subgenres = [
    {
      id: 'contemporary',
      name: 'Contemporary Romance',
      description: 'Modern settings, realistic scenarios',
      visualStyle: 'realistic, modern, urban',
      colorPalette: 'warm neutrals, soft pastels',
      lightingStyle: 'natural, golden hour, soft'
    },
    {
      id: 'historical',
      name: 'Historical Romance',
      description: 'Period pieces, vintage aesthetics',
      visualStyle: 'period accurate, vintage, elegant',
      colorPalette: 'rich jewel tones, sepia, vintage',
      lightingStyle: 'dramatic, candlelight, classical'
    },
    {
      id: 'fantasy',
      name: 'Fantasy Romance',
      description: 'Magical elements, supernatural',
      visualStyle: 'mystical, ethereal, magical',
      colorPalette: 'deep purples, golds, mystical blues',
      lightingStyle: 'magical glow, dramatic shadows, ethereal'
    },
    {
      id: 'billionaire',
      name: 'Billionaire Romance',
      description: 'Luxury settings, high-end lifestyle',
      visualStyle: 'luxurious, high-end, sophisticated',
      colorPalette: 'black, gold, silver, rich colors',
      lightingStyle: 'dramatic, high contrast, cinematic'
    },
    {
      id: 'smalltown',
      name: 'Small Town Romance',
      description: 'Cozy communities, heartwarming',
      visualStyle: 'cozy, intimate, homely',
      colorPalette: 'earth tones, warm colors, natural',
      lightingStyle: 'soft, natural, golden hour'
    },
    {
      id: 'enemies_to_lovers',
      name: 'Enemies to Lovers',
      description: 'Tension, conflict resolution',
      visualStyle: 'dramatic, intense, dynamic',
      colorPalette: 'contrasting colors, bold reds, dramatic',
      lightingStyle: 'high contrast, dramatic shadows, intense'
    }
  ];

  const phases = [
    {
      id: 'project_setup',
      name: 'Project Setup',
      description: 'Notion + Folder Structure',
      icon: <FolderPlus className="w-6 h-6" />,
      tool: 'Organization'
    },
    {
      id: 'character_refs',
      name: 'Character References',
      description: 'Midjourney V7 Character Prompts',
      icon: <Camera className="w-6 h-6" />,
      tool: 'Midjourney'
    },
    {
      id: 'environment_refs',
      name: 'Environment References', 
      description: 'Scene & Location Prompts',
      icon: <Image className="w-6 h-6" />,
      tool: 'Midjourney'
    },
    {
      id: 'runway_refs',
      name: 'Runway References',
      description: 'Tagged Reference Preparation',
      icon: <Layers className="w-6 h-6" />,
      tool: 'Runway'
    },
    {
      id: 'shot_generation',
      name: 'Shot Generation',
      description: 'Individual Shot Prompts',
      icon: <Film className="w-6 h-6" />,
      tool: 'Runway'
    },
    {
      id: 'video_generation',
      name: 'Video Generation',
      description: 'Kling AI & Veo 3 Prompts',
      icon: <Video className="w-6 h-6" />,
      tool: 'Kling/Veo3'
    }
  ];

  const processScript = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const subgenreStyle = subgenres.find(s => s.id === selectedSubgenre);
      const characters = extractCharacters(script + ' ' + storyBible);
      const environments = extractEnvironments(script + ' ' + storyBible, subgenreStyle);
      const shots = extractShots(script);
      const folderStructure = generateFolderStructure(projectName);
      const notionTemplate = generateNotionTemplate(projectName, characters, environments);
      
      setGeneratedContent({
        characterPrompts: characters.map(char => generateCharacterPrompt(char, subgenreStyle)),
        environmentPrompts: environments.map(env => generateEnvironmentPrompt(env, subgenreStyle)),
        shotPrompts: shots.map((shot, idx) => generateShotPrompt(shot, idx + 1, subgenreStyle)),
        videoPrompts: shots.map((shot, idx) => generateVideoPrompt(shot, idx + 1, subgenreStyle)),
        runwayReferences: generateRunwayReferences(characters, environments, subgenreStyle),
        folderStructure: folderStructure,
        notionTemplate: notionTemplate
      });
      
      setIsProcessing(false);
    }, 3000);
  };

  const extractCharacters = (text) => {
    const characters = [];
    
    // Try multiple formats for CHARACTER section
    const characterSection = text.match(/(?:# \*\*CHARACTERS:\*\*|Characters:|CHARACTERS:)(.*?)(?=# \*\*|Plot Beats|PLOT BEATS|Story Beats|STORY BEATS|SHOTLIST|SHOT LIST|$)/si);
    
    if (characterSection) {
      const charText = characterSection[1];
      
      // Format 1: ## **Role (Name) - Age**
      let charMatches = charText.match(/## \*\*([^*]+)\*\*(.*?)(?=## \*\*|$)/gs);
      
      // Format 2: Role (Name) - Age (without markdown)
      if (!charMatches || charMatches.length === 0) {
        // Split by lines and look for character headers
        const lines = charText.split('\n');
        let currentChar = null;
        let currentContent = [];
        
        lines.forEach((line, index) => {
          // Check if line is a character header (contains parentheses and dash with age)
          const charHeaderMatch = line.match(/^([^(]*?)\s*\(([^)]+)\)\s*-\s*(\d+)|^([^-]+)\s*-\s*(\d+)|^\* ([^:]+):/);
          
          if (charHeaderMatch) {
            // Save previous character if exists
            if (currentChar) {
              characters.push(processCharacterData(currentChar, currentContent.join('\n')));
            }
            
            // Start new character
            if (charHeaderMatch[1] && charHeaderMatch[2] && charHeaderMatch[3]) {
              // Format: Role (Name) - Age
              currentChar = {
                role: charHeaderMatch[1].trim(),
                name: charHeaderMatch[2].trim(),
                age: charHeaderMatch[3]
              };
            } else if (charHeaderMatch[4] && charHeaderMatch[5]) {
              // Format: Name - Age
              currentChar = {
                role: '',
                name: charHeaderMatch[4].trim(),
                age: charHeaderMatch[5]
              };
            } else if (charHeaderMatch[6]) {
              // Format: * Name (age):
              const nameAge = charHeaderMatch[6].match(/([^(]+)(?:\s*\((\d+)\))?/);
              currentChar = {
                role: '',
                name: nameAge[1].trim(),
                age: nameAge[2] || ''
              };
            }
            currentContent = [];
          } else if (currentChar) {
            // Add content to current character
            currentContent.push(line);
          }
        });
        
        // Don't forget the last character
        if (currentChar) {
          characters.push(processCharacterData(currentChar, currentContent.join('\n')));
        }
      } else {
        // Process markdown format
        charMatches.forEach(match => {
          const headerMatch = match.match(/## \*\*(.*?)\*\*/);
          if (headerMatch) {
            const header = headerMatch[1].trim();
            const roleNameAge = header.match(/^([^(]+)?\s*\(([^)]+)\)\s*-\s*(\d+)/) ||
                               header.match(/^([^-]+)\s*-\s*(\d+)/);
            
            if (roleNameAge) {
              const charData = {
                role: roleNameAge[1] ? roleNameAge[1].trim() : '',
                name: roleNameAge[2] ? roleNameAge[2].trim() : roleNameAge[1].trim(),
                age: roleNameAge[3] || roleNameAge[2]
              };
              characters.push(processCharacterData(charData, match));
            }
          }
        });
      }
    }
    
    // Fallback: Look for character names in dialogue or story
    if (characters.length === 0) {
      const namePatterns = [
        /^([A-Z][a-z]+ [A-Z][a-z]+) \(\d+\)/gm,
        /([A-Z][A-Z\s]+):/g,
        /\b([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+)\b/g
      ];
      
      const foundNames = new Set();
      namePatterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(match => {
          const name = match.replace(/[(:]/g, '').trim();
          if (name.length > 2 && name.length < 30 && 
              !['SCENE', 'INT', 'EXT', 'FADE', 'SHOT', 'CUT', 'SWIPE', 'FADE', 'BLACK', 'TEXT', 'SCREEN', 'CTA'].includes(name)) {
            foundNames.add(name);
          }
        });
      });
      
      [...foundNames].slice(0, 6).forEach(name => {
        characters.push({
          name: name,
          fullName: name,
          description: `Character ${name} from the story`,
          age: '25-35',
          traits: ['attractive', 'charismatic'],
          style: 'contemporary fashion',
          role: 'Character'
        });
      });
    }
    
    return characters.slice(0, 8);
  };
  
  const processCharacterData = (charData, content) => {
    // Extract Want/Need/Wound/Lie with tab-based format
    const wantMatch = content.match(/Want\s*\n?\s*\t?(.*?)(?=Need|Wound|Lie|$)/si);
    const needMatch = content.match(/Need\s*\n?\s*\t?(.*?)(?=Want|Wound|Lie|$)/si);
    const woundMatch = content.match(/Wound\s*\n?\s*\t?(.*?)(?=Want|Need|Lie|$)/si);
    const lieMatch = content.match(/Lie\s*\n?\s*\t?(.*?)(?=Want|Need|Wound|$)/si);
    
    // Extract description (everything before Want/Need/Wound/Lie)
    const descMatch = content.match(/^(.*?)(?=Want|Need|Wound|Lie|$)/si);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract traits from description
    const traits = [];
    const traitKeywords = {
      'attractive': ['gorgeous', 'pretty', 'handsome', 'good-looking', 'beautiful', 'drop-dead gorgeous'],
      'charismatic': ['charismatic', 'charming', 'draws people', 'vivacious'],
      'intelligent': ['smart', 'intelligent', 'bookworm', 'reads', 'Goethe', 'six languages'],
      'confident': ['confident', 'Type-A', 'commanding'],
      'funny': ['funny', 'humor', 'witty', 'laugh'],
      'mysterious': ['mysterious', 'enigma', 'reserved', 'quiet'],
      'passionate': ['passionate', 'intense', 'fiery'],
      'athletic': ['muscular', 'six-pack', 'gym', 'surfer', 'toned'],
      'friendly': ['peppy', 'outgoing', 'friendly', 'boisterous']
    };
    
    Object.entries(traitKeywords).forEach(([trait, keywords]) => {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        traits.push(trait);
      }
    });
    
    if (traits.length === 0) traits.push('attractive', 'charismatic');
    
    // Extract style
    let style = 'contemporary fashion';
    if (description.includes('bright colors') || description.includes('jewelry')) {
      style = 'bright and colorful style';
    } else if (description.includes('sweater') || description.includes('understated')) {
      style = 'understated elegant style';
    } else if (description.includes('tanks') || description.includes('board shorts') || description.includes('surfer')) {
      style = 'casual beach style';
    } else if (description.includes('dress shirts') || description.includes('finance bro')) {
      style = 'business casual style';
    } else if (description.includes('overalls') || description.includes('garden')) {
      style = 'bohemian style';
    }
    
    return {
      name: charData.name || 'Unknown',
      fullName: `${charData.role} (${charData.name})`.trim(),
      role: charData.role || 'Character',
      age: charData.age || '25-35',
      description: description.substring(0, 300),
      appearance: description,
      traits: traits,
      style: style,
      want: wantMatch ? wantMatch[1].trim() : '',
      need: needMatch ? needMatch[1].trim() : '',
      wound: woundMatch ? woundMatch[1].trim() : '',
      lie: lieMatch ? lieMatch[1].trim() : ''
    };
  };

  const extractTimeFromLocation = (location) => {
    const timeKeywords = {
      'DAY': 'day',
      'NIGHT': 'night',
      'MORNING': 'morning',
      'EVENING': 'evening',
      'DUSK': 'dusk',
      'DAWN': 'dawn',
      'SUNSET': 'sunset',
      'AFTERNOON': 'afternoon'
    };
    
    const upperLoc = location.toUpperCase();
    for (const [keyword, value] of Object.entries(timeKeywords)) {
      if (upperLoc.includes(keyword)) {
        return value;
      }
    }
    return 'day'; // default
  };

  const extractEnvironments = (text, subgenreStyle) => {
    const environments = [];
    
    // Look for ENVIRONMENTS section
    const envSection = text.match(/(?:# \*\*ENVIRONMENTS:\*\*|Environments:|ENVIRONMENTS:)(.*?)(?=# \*\*|Characters:|CHARACTERS:|Plot Beats|PLOT BEATS|$)/si);
    
    if (envSection) {
      const envText = envSection[1];
      
      // Look for environments with format: * INT./EXT. LOCATION - TIME
      const envMatches = envText.match(/\*\s*(INT\.|EXT\.)\s*([^-\n]+)\s*-\s*([^:\n]+):?\s*([^*]*?)(?=\*\s*(?:INT\.|EXT\.)|$)/gs) ||
                        envText.match(/-\s+\*\*(.*?)\*\*:(.*?)(?=-\s+\*\*|$)/gs);
      
      if (envMatches) {
        envMatches.forEach(match => {
          let location = '', description = '', timeOfDay = 'day', locationType = 'interior';
          
          // Try format: * INT./EXT. LOCATION - TIME: Description
          const standardMatch = match.match(/\*\s*(INT\.|EXT\.)\s*([^-\n]+)\s*-\s*([^:\n]+):?\s*(.*)/s);
          if (standardMatch) {
            locationType = standardMatch[1].includes('INT') ? 'interior' : 'exterior';
            location = standardMatch[2].trim();
            timeOfDay = extractTimeFromLocation(standardMatch[3]);
            description = standardMatch[4].trim();
          } else {
            // Try format: - **LOCATION**: Description
            const altMatch = match.match(/-\s+\*\*(.*?)\*\*:(.*)/s);
            if (altMatch) {
              location = altMatch[1].trim();
              description = altMatch[2].trim();
              
              // Extract INT/EXT and time from location
              if (location.includes('INT.')) locationType = 'interior';
              if (location.includes('EXT.')) locationType = 'exterior';
              timeOfDay = extractTimeFromLocation(location);
              
              // Clean location name
              location = location.replace(/INT\.|EXT\./, '').replace(/--|-/, '').trim();
            }
          }
          
          if (location) {
            // Extract visual elements from description
            const visualElements = [];
            const elementKeywords = {
              'dramatic lighting': ['darkness', 'dark', 'shadows'],
              'moody lighting': ['low light', 'dim'],
              'industrial textures': ['exposed brick', 'warehouse', 'industrial'],
              'architectural depth': ['high ceilings', 'grand', 'spacious'],
              'urban backdrop': ['skyline', 'city', 'downtown'],
              'natural elements': ['trees', 'garden', 'beach', 'park'],
              'luxury elements': ['elegant', 'upscale', 'grand', 'luxurious'],
              'cozy atmosphere': ['cozy', 'warm', 'intimate', 'small']
            };
            
            Object.entries(elementKeywords).forEach(([element, keywords]) => {
              if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
                visualElements.push(element);
              }
            });
            
            environments.push({
              name: location,
              fullLocation: match.trim(),
              description: description || `${location} setting`,
              timeOfDay: timeOfDay,
              locationType: locationType,
              visualElements: visualElements,
              mood: subgenreStyle.visualStyle,
              colorPalette: subgenreStyle.colorPalette
            });
          }
        });
      }
    }
    
    // Fallback: Look for locations in shot list
    if (environments.length === 0) {
      const shotSection = text.match(/(?:SHOTLIST|Shot List|SHOT LIST)(.*?)$/si);
      if (shotSection) {
        const locationMatches = shotSection[1].match(/(INT\.|EXT\.)\s+([^-\n]+)/g) || [];
        const uniqueLocations = [...new Set(locationMatches)];
        
        uniqueLocations.forEach(loc => {
          const locationType = loc.includes('INT.') ? 'interior' : 'exterior';
          const cleanLoc = loc.replace(/INT\.|EXT\./, '').trim();
          
          environments.push({
            name: cleanLoc,
            fullLocation: loc,
            description: `${cleanLoc} setting`,
            timeOfDay: extractTimeFromLocation(loc),
            locationType: locationType,
            visualElements: [],
            mood: subgenreStyle.visualStyle,
            colorPalette: subgenreStyle.colorPalette
          });
        });
      }
    }
    
    return environments.slice(0, 10);
  };

  const extractShots = (text) => {
    const shots = [];
    
    // Look for SHOTLIST section
    const shotSection = text.match(/(?:# \*\*SHOTLIST.*?\*\*:|SHOTLIST|Shot List|SHOT LIST)(.*?)(?=# \*\*|$)/si);
    
    if (shotSection) {
      const shotText = shotSection[1];
      
      // Look for shots with format: SHOT N or **SHOT N**
      const shotMatches = shotText.match(/(?:\*\*)?SHOT\s+\d+(?:\*\*)?(.*?)(?=(?:\*\*)?SHOT\s+\d+(?:\*\*)?|$)/gis);
      
      if (shotMatches) {
        shotMatches.forEach((match, idx) => {
          const shotNumber = idx + 1;
          
          // Extract location
          const locationMatch = match.match(/(INT\.|EXT\.)\s+([^-\n]+?)(?:\s*--?\s*|\n)/);
          const location = locationMatch ? locationMatch[0].trim() : 'Unknown Location';
          
          // Extract shot type (W, M, CU, MCU, OTS, etc.)
          const shotTypeMatch = match.match(/\*\*([A-Z]+)\*\*|\b(W|M|CU|MCU|OTS|ECW)\b/);
          const shotTypeAbbr = shotTypeMatch ? (shotTypeMatch[1] || shotTypeMatch[2]) : 'M';
          const shotType = expandShotType(shotTypeAbbr.toLowerCase());
          
          // Extract description
          const descMatch = match.match(/(?:INT\.|EXT\.)[^:]*?(?:\*\*[A-Z]+\*\*)?\s*(.*?)(?=🗣|V\.O\.|$)/s);
          const description = descMatch ? descMatch[1].trim() : match.trim();
          
          // Extract voiceover
          const voMatch = match.match(/🗣\s*V\.O\.:\s*(.*?)(?=\n|$)/s);
          const voiceover = voMatch ? voMatch[1].trim() : '';
          
          // Extract emotion from description and voiceover
          const emotion = extractEmotionFromDescription(description + ' ' + voiceover);
          
          // Extract characters mentioned
          const characters = extractCharactersFromShot(description);
          
          shots.push({
            number: shotNumber,
            location: location,
            shotType: shotType,
            description: description.substring(0, 200),
            voiceover: voiceover,
            emotion: emotion,
            characters: characters,
            timeOfDay: extractTimeFromLocation(location),
            isDialogue: voiceover.length > 0 || description.includes('says') || description.includes('tells')
          });
        });
      }
    }
    
    // Fallback: Create shots from scenes or story beats
    if (shots.length === 0) {
      const lines = text.split('\n').filter(line => line.trim());
      const sceneLines = lines.filter(line => 
        line.includes('INT.') || line.includes('EXT.') || 
        line.includes('SCENE') || line.includes('Scene')
      );
      
      sceneLines.slice(0, 20).forEach((line, idx) => {
        shots.push({
          number: idx + 1,
          location: line.trim(),
          description: line.trim(),
          shotType: idx % 3 === 0 ? 'close-up' : idx % 3 === 1 ? 'medium' : 'wide',
          emotion: idx % 4 === 0 ? 'romantic' : idx % 4 === 1 ? 'dramatic' : idx % 4 === 2 ? 'tender' : 'passionate',
          characters: [],
          timeOfDay: 'day',
          isDialogue: false
        });
      });
    }
    
    return shots.slice(0, 20);
  };

  const expandShotType = (shotType) => {
    const shotTypeMap = {
      'w': 'wide',
      'm': 'medium',
      'cu': 'close-up',
      'mcu': 'medium close-up',
      'ots': 'over-the-shoulder',
      'ecw': 'extreme close-up',
      'ew': 'extreme wide',
      'ms': 'medium shot',
      'fs': 'full shot',
      'ls': 'long shot'
    };
    
    return shotTypeMap[shotType.toLowerCase()] || shotType.toLowerCase();
  };

  const extractEmotionFromDescription = (description) => {
    const emotionKeywords = {
      'romantic': ['romantic', 'love', 'kiss', 'tender', 'intimate', 'mesmerized', 'struts'],
      'dramatic': ['dramatic', 'shocked', 'angry', 'tense', 'conflict', 'confrontation', 'furiously'],
      'confident': ['confident', 'powerful', 'commanding', 'strut', 'winks'],
      'vulnerable': ['vulnerable', 'scared', 'crying', 'tears', 'broken', 'hurt'],
      'playful': ['playful', 'laughing', 'giggling', 'fun', 'joke', 'cute'],
      'passionate': ['passionate', 'intense', 'brooding', 'muscles', 'sweat'],
      'mysterious': ['mysterious', 'enigmatic', 'secretive', 'hidden'],
      'tender': ['tender', 'gentle', 'soft', 'caring', 'sweet']
    };
    
    const lowerDesc = description.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return emotion;
      }
    }
    return 'neutral';
  };

  const extractCharactersFromShot = (description) => {
    // Look for capitalized names
    const nameMatches = description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    
    // Also look for dialogue speakers
    const dialogueMatches = description.match(/^([A-Z]+)\s*\n/gm) || [];
    dialogueMatches.forEach(match => {
      const name = match.trim();
      if (name && !nameMatches.includes(name)) {
        nameMatches.push(name);
      }
    });
    
    return nameMatches.filter(name => 
      name.length > 2 && 
      !['INT', 'EXT', 'DAY', 'NIGHT', 'SHOT', 'FADE', 'CUT', 'The', 'And', 'But', 'She', 'His', 'Her', 'They', 'You', 'Its', 'This', 'That', 'With', 'From', 'Into', 'Over', 'Under', 'Close', 'Wide', 'Medium'].includes(name)
    );
  };

  const generateCharacterPrompt = (character, subgenreStyle) => {
    // Build a more detailed prompt using all available character info
    const rolePrefix = character.role ? `${character.role}, ` : '';
    const ageInfo = character.age ? `, ${character.age} years old` : '';
    const wantInfo = character.want ? `, ${character.want}` : '';
    
    // Create variations based on character's emotional journey
    const emotionalVariations = [];
    if (character.need) emotionalVariations.push('vulnerable expression showing inner need');
    if (character.wound) emotionalVariations.push('hint of past pain in eyes');
    if (character.want) emotionalVariations.push('determined expression');
    emotionalVariations.push('confident pose');
    
    return {
      character: character.name,
      role: character.role || 'Main Character',
      midjourneyPrompt: `photorealistic, cinematic, cinematographic character reference, ${rolePrefix}${character.name}, ${character.traits.join(', ')}, ${subgenreStyle.visualStyle}, ${subgenreStyle.colorPalette}, ${subgenreStyle.lightingStyle}, professional headshot${ageInfo}, ${character.style}, dramatic lighting, 4K, ultra detailed, film photography style --ar 3:4 --v 7.0 --style raw --personalize`,
      personalizedTags: `@${character.name.replace(/\s+/g, '')}Character`,
      characterDetails: {
        want: character.want || 'Character goal',
        need: character.need || 'Character need',
        wound: character.wound || 'Character backstory',
        lie: character.lie || 'Character belief'
      },
      subgenreSpecific: {
        outfits: getSubgenreOutfits(selectedSubgenre),
        expressions: getSubgenreExpressions(selectedSubgenre),
        poses: getSubgenrePoses(selectedSubgenre)
      },
      variations: emotionalVariations.slice(0, 4).map((variation, idx) => 
        `${variation}, ${subgenreStyle.lightingStyle}, ${subgenreStyle.colorPalette}`
      )
    };
  };

  const generateEnvironmentPrompt = (environment, subgenreStyle) => ({
    environment: environment.name,
    midjourneyPrompt: `photorealistic, cinematic, cinematographic environment reference, ${environment.name}, ${subgenreStyle.visualStyle}, ${subgenreStyle.colorPalette}, ${subgenreStyle.lightingStyle}, atmospheric, film quality, ultra detailed, 4K, ${environment.mood} --ar 16:9 --v 7.0 --style raw --personalize`,
    personalizedTags: `@${environment.name.replace(/\s+/g, '')}Environment`,
    subgenreElements: getSubgenreEnvironmentElements(selectedSubgenre, environment.name),
    variations: [
      `${subgenreStyle.lightingStyle}, ${subgenreStyle.colorPalette}`,
      `dramatic shadows, ${subgenreStyle.visualStyle}`,
      `soft romantic lighting, ${environment.mood}`,
      `cinematic composition, ${subgenreStyle.colorPalette}`
    ]
  });

  const generateShotPrompt = (shot, number, subgenreStyle) => {
    const characterDetails = shot.characters && shot.characters.length > 0 
      ? `featuring ${shot.characters.join(' and ')}, ` 
      : '';
    const emotionDetails = shot.emotion && shot.emotion !== 'neutral' 
      ? `${shot.emotion} scene, ` 
      : '';
    const locationDetails = shot.location 
      ? `${shot.location}, ` 
      : '';
    const timeDetails = shot.timeOfDay && shot.timeOfDay !== 'day'
      ? `${shot.timeOfDay} time, `
      : '';
    
    const basePrompt = `Shot ${number}: ${shot.description}`;
    const fullPrompt = `${basePrompt}, ${locationDetails}${timeDetails}${characterDetails}${emotionDetails}${shot.shotType} shot, ${subgenreStyle.visualStyle}, ${subgenreStyle.lightingStyle}, cinematic composition, ${subgenreStyle.colorPalette}, film quality, professional cinematography, emotional storytelling`;
    
    return {
      shotNumber: number,
      description: shot.description,
      runwayPrompt: fullPrompt,
      shotType: shot.shotType,
      emotion: shot.emotion,
      characters: shot.characters || [],
      location: shot.location,
      timeOfDay: shot.timeOfDay,
      isDialogue: shot.isDialogue,
      voiceover: shot.voiceover,
      subgenreStyle: subgenreStyle.visualStyle,
      technicalNotes: `Use Runway References assistant. ${shot.shotType} shot emphasizing ${shot.emotion} emotion${shot.location ? ` in ${shot.location}` : ''}. ${subgenreStyle.name.toLowerCase()} aesthetic.`
    };
  };

  const generateVideoPrompt = (shot, number, subgenreStyle) => {
    const characterDetails = shot.characters && shot.characters.length > 0 
      ? `${shot.characters.join(' and ')} in the scene, ` 
      : '';
    const emotionContext = shot.emotion && shot.emotion !== 'neutral' 
      ? `${shot.emotion} emotion, ` 
      : '';
    const timeContext = shot.timeOfDay && shot.timeOfDay !== 'day'
      ? `${shot.timeOfDay} time setting, `
      : '';
    
    const basePrompt = shot.description;
    
    const klingPrompt = `Cinematic ${shot.shotType} shot: ${characterDetails}${basePrompt}. ${timeContext}${emotionContext}${subgenreStyle.name.toLowerCase()} scene. ${subgenreStyle.visualStyle}, ${subgenreStyle.lightingStyle}, ${subgenreStyle.colorPalette}. Smooth camera movement, natural human expressions, film quality cinematography with emotional depth.`;
    
    const veoPrompt = `High-quality cinematic footage: ${basePrompt}. ${characterDetails}${shot.shotType} shot with ${shot.emotion} emotion. ${timeContext}${subgenreStyle.visualStyle} aesthetic, ${subgenreStyle.lightingStyle}, ${subgenreStyle.colorPalette}. Professional camera work, realistic human motion, atmospheric lighting, ${subgenreStyle.name.toLowerCase()} movie-style production values.`;
    
    return {
      shotNumber: number,
      description: shot.description,
      klingPrompt: klingPrompt,
      veoPrompt: veoPrompt,
      characters: shot.characters || [],
      emotion: shot.emotion,
      shotType: shot.shotType,
      isDialogue: shot.isDialogue,
      voiceover: shot.voiceover,
      presets: getSubgenrePresets(selectedSubgenre),
      duration: shot.isDialogue ? '6-8 seconds' : '5-10 seconds',
      subgenreNotes: getSubgenreVideoNotes(selectedSubgenre)
    };
  };

  const generateRunwayReferences = (characters, environments, subgenreStyle) => {
    const references = [];
    
    characters.forEach(char => {
      references.push({
        type: 'character',
        name: char.name,
        tag: `@${char.name.replace(/\s+/g, '')}Character`,
        extraOutfits: getSubgenreOutfits(selectedSubgenre),
        expressions: getSubgenreExpressions(selectedSubgenre),
        subgenreStyle: subgenreStyle.visualStyle
      });
    });
    
    environments.forEach(env => {
      references.push({
        type: 'environment',
        name: env.name,
        tag: `@${env.name.replace(/\s+/g, '')}Environment`,
        variations: getSubgenreEnvironmentVariations(selectedSubgenre),
        subgenreElements: getSubgenreEnvironmentElements(selectedSubgenre, env.name)
      });
    });
    
    return references;
  };

  const generateFolderStructure = (projectName) => {
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    return {
      mainFolder: `01_${sanitizedName}`,
      structure: [
        '01_Direct_Links',
        '02_Information',
        '├── 01_Overall_Software_Guidelines_For_Claude',
        '├── 02_Scripts_and_Character_Descriptions',
        '03_MoodBoard_Images',
        '04_Character_References',
        '├── CR_Character1',
        '├── CR_Character2',
        '05_Environment_References',
        '├── ER_Environment1',
        '├── ER_Environment2',
        '06_Shot_References',
        '├── Batch_01_Shots_1-5',
        '├── Batch_02_Shots_6-10',
        '├── Batch_03_Shots_11-15',
        '├── Batch_04_Shots_16-20',
        '07_Video_Generation',
        '├── Kling_Videos',
        '├── Veo3_Videos',
        '08_Footage_For_Edit',
        '├── 01_Voice_Over',
        '├── 02_Generated_Videos',
        '├── 03_Music_and_SFX',
        '09_Final_Assets',
        '├── Poster_Design',
        '├── Social_Media_Assets',
        '10_Project_Files',
        '├── Adobe_Premiere',
        '├── After_Effects'
      ]
    };
  };

  const generateNotionTemplate = (projectName, characters, environments) => {
    return {
      title: `${projectName} - AI Trailer Production`,
      properties: {
        'Project Status': 'Pre-Production',
        'Assigned Artist': 'TBD',
        'Producer': 'TBD',
        'Subgenre': selectedSubgenre,
        'Target Completion': '3 days from start',
        'EMT Mode Activated': false
      },
      sections: [
        {
          title: '📋 Project Overview',
          content: `
**Project Name:** ${projectName}
**Subgenre:** ${subgenres.find(s => s.id === selectedSubgenre)?.name}
**Status:** Ready for Artist Assignment
**Timeline:** 2 days generation + 1 day review/editing
          `
        },
        {
          title: '👥 Characters',
          content: characters.map(char => {
            let charContent = `**${char.name}**`;
            if (char.role) charContent += ` (${char.role})`;
            if (char.age) charContent += ` - ${char.age} years old`;
            charContent += `\n- Description: ${char.description}`;
            charContent += `\n- Traits: ${char.traits.join(', ')}`;
            if (char.want) charContent += `\n- Want: ${char.want}`;
            if (char.need) charContent += `\n- Need: ${char.need}`;
            if (char.wound) charContent += `\n- Wound: ${char.wound}`;
            if (char.lie) charContent += `\n- Lie: ${char.lie}`;
            charContent += `\n- Reference Tag: @${char.name.replace(/\s+/g, '')}Character`;
            return charContent;
          }).join('\n\n')
        },
        {
          title: '🏞️ Environments',
          content: environments.map(env => `
**${env.name}**
- Description: ${env.description}
- Mood: ${env.mood}
- Reference Tag: @${env.name.replace(/\s+/g, '')}Environment
          `).join('\n')
        },
        {
          title: '✅ Production Checklist',
          content: `
- [ ] Claude Project Setup
- [ ] Asset Collection Complete
- [ ] Character References Generated (4-5 per character)
- [ ] Environment References Generated (4-5 per environment)
- [ ] Producer Review - Character References
- [ ] Producer Review - Environment References
- [ ] Batch 1: Shots 1-5 Generated
- [ ] Producer Approval - Batch 1
- [ ] Batch 2: Shots 6-10 Generated
- [ ] Producer Approval - Batch 2
- [ ] Batch 3: Shots 11-15 Generated
- [ ] Producer Approval - Batch 3
- [ ] Batch 4: Shots 16-20 Generated
- [ ] Producer Approval - Batch 4
- [ ] Video Generation Complete (Kling/Veo3)
- [ ] Poster Design Generated
- [ ] Rough Cut Complete
- [ ] Producer Review - Rough Cut
- [ ] Brain Trust Review
- [ ] Final Cut Complete
- [ ] Johannes Final Review
- [ ] Project Complete
          `
        },
        {
          title: '🚨 EMT Mode Tracking',
          content: `
**EMT Triggers:**
- 2 rounds of notes without satisfactory resolution
- Technical tool failures
- Script adaptation needed
- AI capability limitations

**Current Issues:** None
**Resolution Status:** N/A
          `
        }
      ]
    };
  };

  // Helper functions for subgenre-specific content
  const getSubgenreOutfits = (subgenre) => {
    const outfitMap = {
      contemporary: ['casual chic', 'business attire', 'date night outfit', 'workout clothes'],
      historical: ['period dress', 'formal gown', 'riding habit', 'ball gown'],
      fantasy: ['mystical robes', 'warrior attire', 'enchanted dress', 'royal garments'],
      billionaire: ['designer suit', 'evening gown', 'luxury casual', 'red carpet attire'],
      smalltown: ['sundress', 'flannel shirt', 'cozy sweater', 'farmer market outfit'],
      enemies_to_lovers: ['power suit', 'confrontational attire', 'vulnerable casual', 'reconciliation outfit']
    };
    return outfitMap[subgenre] || outfitMap.contemporary;
  };

  const getSubgenreExpressions = (subgenre) => {
    const expressionMap = {
      contemporary: ['genuine smile', 'thoughtful', 'confident', 'vulnerable'],
      historical: ['demure', 'passionate', 'defiant', 'longing'],
      fantasy: ['mystical', 'powerful', 'enchanted', 'otherworldly'],
      billionaire: ['commanding', 'seductive', 'powerful', 'intense'],
      smalltown: ['warm', 'friendly', 'wholesome', 'caring'],
      enemies_to_lovers: ['challenging', 'defiant', 'surprised', 'softening']
    };
    return expressionMap[subgenre] || expressionMap.contemporary;
  };

  const getSubgenrePoses = (subgenre) => {
    const poseMap = {
      contemporary: ['natural standing', 'casual lean', 'walking', 'sitting relaxed'],
      historical: ['formal portrait', 'curtsy', 'elegant pose', 'dancing position'],
      fantasy: ['magical gesture', 'powerful stance', 'ethereal pose', 'mystical'],
      billionaire: ['power pose', 'luxury setting', 'commanding presence', 'sophisticated'],
      smalltown: ['friendly wave', 'outdoor natural', 'community gathering', 'home comfort'],
      enemies_to_lovers: ['confrontational', 'defensive', 'challenging', 'yielding']
    };
    return poseMap[subgenre] || poseMap.contemporary;
  };

  const getSubgenreEnvironmentElements = (subgenre, environmentName) => {
    const elementMap = {
      contemporary: ['modern furniture', 'urban backdrop', 'contemporary art', 'sleek design'],
      historical: ['period furniture', 'vintage decor', 'classical architecture', 'antique elements'],
      fantasy: ['magical elements', 'mystical lighting', 'enchanted objects', 'supernatural atmosphere'],
      billionaire: ['luxury items', 'expensive decor', 'high-end finishes', 'opulent details'],
      smalltown: ['rustic charm', 'cozy elements', 'community feel', 'homey touches'],
      enemies_to_lovers: ['contrasting elements', 'tension-building props', 'symbolic items', 'dramatic lighting']
    };
    return elementMap[subgenre] || elementMap.contemporary;
  };

  const getSubgenreEnvironmentVariations = (subgenre) => {
    const variationMap = {
      contemporary: ['day time natural', 'evening city lights', 'golden hour', 'modern lighting'],
      historical: ['candlelight', 'fireplace glow', 'period appropriate', 'classical lighting'],
      fantasy: ['magical glow', 'mystical atmosphere', 'enchanted lighting', 'supernatural'],
      billionaire: ['luxury lighting', 'dramatic shadows', 'high-end ambiance', 'sophisticated'],
      smalltown: ['natural sunlight', 'cozy interior', 'warm atmosphere', 'homey lighting'],
      enemies_to_lovers: ['dramatic lighting', 'contrasting shadows', 'tension atmosphere', 'intense']
    };
    return variationMap[subgenre] || variationMap.contemporary;
  };

  const getSubgenrePresets = (subgenre) => {
    const presetMap = {
      contemporary: ['Handheld', 'Natural', 'Realistic'],
      historical: ['Classical', 'Dramatic', 'Period'],
      fantasy: ['Mystical', 'Ethereal', 'Magical'],
      billionaire: ['Cinematic', 'Luxury', 'High-end'],
      smalltown: ['Natural', 'Cozy', 'Warm'],
      enemies_to_lovers: ['Dramatic', 'Intense', 'Dynamic']
    };
    return presetMap[subgenre] || presetMap.contemporary;
  };

  const getSubgenreVideoNotes = (subgenre) => {
    const noteMap = {
      contemporary: 'Focus on natural, realistic movements and modern pacing',
      historical: 'Emphasize period-appropriate movements and classical cinematography',
      fantasy: 'Include mystical elements and otherworldly atmosphere',
      billionaire: 'Highlight luxury settings and sophisticated camera work',
      smalltown: 'Capture warm, community-focused, heartwarming moments',
      enemies_to_lovers: 'Build tension through dynamic camera work and contrasting elements'
    };
    return noteMap[subgenre] || noteMap.contemporary;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScript(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text, index) => {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(-1), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(-1), 2000);
        } catch (err) {
          alert('Copy failed. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      });
    } catch (err) {
      alert('Copy failed. Please select and copy manually.');
    }
  };

  const exportAllPrompts = () => {
    if (!projectName || !generatedContent.characterPrompts.length) return;
    
    let exportText = `# AI TRAILER PRODUCTION PROMPTS\n`;
    exportText += `# Project: ${projectName}\n`;
    exportText += `# Subgenre: ${subgenres.find(s => s.id === selectedSubgenre)?.name}\n`;
    exportText += `# Generated: ${new Date().toLocaleString()}\n\n`;
    
    exportText += `${'='.repeat(80)}\n\n`;
    
    // Character Prompts
    if (generatedContent.characterPrompts.length > 0) {
      exportText += `## CHARACTER PROMPTS (MIDJOURNEY V7)\n\n`;
      generatedContent.characterPrompts.forEach((prompt, idx) => {
        exportText += `### Character ${idx + 1}: ${prompt.character}\n`;
        if (prompt.role) exportText += `Role: ${prompt.role}\n`;
        exportText += `Tag: ${prompt.personalizedTags}\n\n`;
        exportText += `**Midjourney Prompt:**\n${prompt.midjourneyPrompt}\n\n`;
        if (prompt.characterDetails) {
          exportText += `**Character Arc:**\n`;
          if (prompt.characterDetails.want) exportText += `- Want: ${prompt.characterDetails.want}\n`;
          if (prompt.characterDetails.need) exportText += `- Need: ${prompt.characterDetails.need}\n`;
          if (prompt.characterDetails.wound) exportText += `- Wound: ${prompt.characterDetails.wound}\n`;
          if (prompt.characterDetails.lie) exportText += `- Lie: ${prompt.characterDetails.lie}\n`;
          exportText += '\n';
        }
        exportText += `${'='.repeat(80)}\n\n`;
      });
    }
    
    // Environment Prompts
    if (generatedContent.environmentPrompts.length > 0) {
      exportText += `## ENVIRONMENT PROMPTS (MIDJOURNEY V7)\n\n`;
      generatedContent.environmentPrompts.forEach((prompt, idx) => {
        exportText += `### Environment ${idx + 1}: ${prompt.environment}\n`;
        exportText += `Tag: ${prompt.personalizedTags}\n\n`;
        exportText += `**Midjourney Prompt:**\n${prompt.midjourneyPrompt}\n\n`;
        exportText += `${'='.repeat(80)}\n\n`;
      });
    }
    
    // Shot Prompts
    if (generatedContent.shotPrompts.length > 0) {
      exportText += `## SHOT PROMPTS (RUNWAY)\n\n`;
      generatedContent.shotPrompts.forEach((prompt) => {
        exportText += `### Shot ${prompt.shotNumber}\n`;
        exportText += `Type: ${prompt.shotType} | Emotion: ${prompt.emotion}\n`;
        if (prompt.characters.length > 0) exportText += `Characters: ${prompt.characters.join(', ')}\n`;
        exportText += `\n**Runway Prompt:**\n${prompt.runwayPrompt}\n\n`;
        if (prompt.voiceover) exportText += `**Voiceover:** "${prompt.voiceover}"\n\n`;
        exportText += `${'='.repeat(80)}\n\n`;
      });
    }
    
    // Video Prompts
    if (generatedContent.videoPrompts.length > 0) {
      exportText += `## VIDEO PROMPTS (KLING AI & VEO 3)\n\n`;
      generatedContent.videoPrompts.forEach((prompt) => {
        exportText += `### Video Shot ${prompt.shotNumber}\n\n`;
        exportText += `**Kling AI Prompt:**\n${prompt.klingPrompt}\n\n`;
        exportText += `**Veo 3 Prompt:**\n${prompt.veoPrompt}\n\n`;
        exportText += `Duration: ${prompt.duration} | Presets: ${prompt.presets.join(', ')}\n`;
        exportText += `Subgenre Notes: ${prompt.subgenreNotes}\n\n`;
        exportText += `${'='.repeat(80)}\n\n`;
      });
    }
    
    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_all_prompts.txt`;
    downloadTextFile(exportText, filename);
  };

  const downloadTextFile = (content, filename) => {
    try {
      // Method 1: Using Blob and createObjectURL
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback: Open in new window
      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      const newWindow = window.open(dataUri, '_blank');
      if (newWindow) {
        newWindow.document.title = filename;
      } else {
        alert('Download failed. Please use the Copy button instead.');
      }
    }
  };

  const downloadFolderStructure = () => {
    if (!generatedContent.folderStructure) return;
    
    const structureText = `# ${generatedContent.folderStructure.mainFolder} - Folder Structure\n\n${generatedContent.folderStructure.structure.join('\n')}`;
    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_folder_structure.txt`;
    
    downloadTextFile(structureText, filename);
  };

  const downloadNotionTemplate = () => {
    if (!generatedContent.notionTemplate) return;
    
    const template = generatedContent.notionTemplate;
    let notionText = `# ${template.title}\n\n`;
    
    // Add properties
    notionText += `## Properties\n`;
    Object.entries(template.properties).forEach(([key, value]) => {
      notionText += `- **${key}**: ${value}\n`;
    });
    notionText += '\n';
    
    // Add sections
    template.sections.forEach(section => {
      notionText += `## ${section.title}\n${section.content}\n\n`;
    });
    
    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_notion_template.md`;
    downloadTextFile(notionText, filename);
  };

  const copyFolderStructure = () => {
    if (!generatedContent.folderStructure) return;
    
    const structureText = `# ${generatedContent.folderStructure.mainFolder} - Folder Structure\n\n${generatedContent.folderStructure.structure.join('\n')}`;
    copyToClipboard(structureText, 9999);
  };

  const copyNotionTemplate = () => {
    if (!generatedContent.notionTemplate) return;
    
    const template = generatedContent.notionTemplate;
    let notionText = `# ${template.title}\n\n`;
    
    Object.entries(template.properties).forEach(([key, value]) => {
      notionText += `- **${key}**: ${value}\n`;
    });
    notionText += '\n';
    
    template.sections.forEach(section => {
      notionText += `## ${section.title}\n${section.content}\n\n`;
    });
    
    copyToClipboard(notionText, 9998);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Video className="text-purple-500" />
            AI Trailer Production Automatisierung PRO
            <Sparkles className="text-pink-500" />
          </h1>
          <p className="text-gray-600 text-lg">Complete Workflow Automation: Script → Notion → Folders → All AI Tools</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-blue-500" />
            1. Project Configuration
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="font-semibold mb-2 block">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Flame, Popularity, etc."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="font-semibold mb-2 block">Romance Subgenre</label>
              <select
                value={selectedSubgenre}
                onChange={(e) => setSelectedSubgenre(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {subgenres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-lg text-center w-full">
                <Heart className="mx-auto mb-1 text-pink-500" size={24} />
                <p className="text-sm font-medium">{subgenres.find(s => s.id === selectedSubgenre)?.description}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Trailer Script</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.doc,.docx"
                  className="hidden"
                />
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload Script
                </button>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter trailer script here...

Example format:
CHARACTERS:
Protagonist (Jane Doe) - 25
Description of the character...
Want
	Character's goal
Need
	Character's need
Wound
	Character's backstory
Lie
	Character's false belief

Love Interest (John Smith) - 28
Description...

ENVIRONMENTS:
* INT. LOCATION - DAY: Description of the location...

SHOTLIST:
SHOT 1
INT. LOCATION - DAY
Description of what happens...
🗣 V.O.: Voiceover text..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Story Bible & Character Descriptions</h3>
              <textarea
                value={storyBible}
                onChange={(e) => setStoryBible(e.target.value)}
                placeholder="Enter story bible and detailed character descriptions here..."
                className="w-full h-48 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {(script || storyBible) && projectName && (
            <button
              onClick={processScript}
              disabled={isProcessing}
              className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto transform hover:scale-105 transition-transform"
            >
              <Wand2 size={20} />
              {isProcessing ? 'Generating Complete Workflow...' : 'Generate Complete Production Pipeline'}
            </button>
          )}
        </div>

        {/* Subgenre Info Display */}
        {selectedSubgenre && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Palette className="text-pink-500" />
              {subgenres.find(s => s.id === selectedSubgenre)?.name} Style Guide
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subgenres.find(s => s.id === selectedSubgenre) && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Visual Style</h4>
                    <p className="text-blue-700 text-sm">{subgenres.find(s => s.id === selectedSubgenre).visualStyle}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Color Palette</h4>
                    <p className="text-green-700 text-sm">{subgenres.find(s => s.id === selectedSubgenre).colorPalette}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Lighting Style</h4>
                    <p className="text-yellow-700 text-sm">{subgenres.find(s => s.id === selectedSubgenre).lightingStyle}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Phase Selection */}
        {generatedContent.characterPrompts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="text-purple-500" />
              2. Production Phase Selection
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center hover:shadow-lg transform hover:scale-105 ${
                    selectedPhase === phase.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="mb-2 flex justify-center">{phase.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{phase.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{phase.description}</p>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{phase.tool}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Content Display */}
        {generatedContent.characterPrompts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Image className="text-green-500" />
              3. {phases.find(p => p.id === selectedPhase)?.name}
            </h2>
            
            {selectedPhase === 'project_setup' && (
              <div className="space-y-6">
                {/* Download Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Download Issues?</p>
                      <p className="text-sm text-blue-700">If downloads don't work, use the Copy button instead and paste into a text file. Some browsers block automatic downloads for security reasons.</p>
                    </div>
                  </div>
                </div>
                
                {/* Folder Structure */}
                <div className="border rounded-xl p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <FolderPlus className="text-blue-500" />
                      Folder Structure
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copyFolderStructure}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                      >
                        {copiedIndex === 9999 ? <Check size={16} /> : <Copy size={16} />}
                        {copiedIndex === 9999 ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={downloadFolderStructure}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                        title="Download as text file"
                      >
                        <Download size={16} />
                        Download .txt
                      </button>
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                          generatedContent.folderStructure 
                            ? `# ${generatedContent.folderStructure.mainFolder} - Folder Structure\n\n${generatedContent.folderStructure.structure.join('\n')}`
                            : ''
                        )}`}
                        download={`${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_folder_structure.txt`}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                        title="Alternative download method"
                      >
                        <Download size={16} />
                        Alt Download
                      </a>
                    </div>
                  </div>
                  
                  {generatedContent.folderStructure && (
                    <>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                        <div className="mb-2 text-yellow-400">📁 {generatedContent.folderStructure.mainFolder}/</div>
                        {generatedContent.folderStructure.structure.map((folder, idx) => (
                          <div key={idx} className="ml-2">
                            {folder.startsWith('├──') ? (
                              <span className="text-blue-400">{folder}</span>
                            ) : (
                              <span className="text-green-400">📁 {folder}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Manual Save Instructions */}
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <strong>Manual Save:</strong> Select all text above (Ctrl/Cmd+A), copy (Ctrl/Cmd+C), 
                          and paste into a new text file named "{projectName}_folder_structure.txt"
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Notion Template */}
                <div className="border rounded-xl p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Database className="text-purple-500" />
                      Notion Template
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copyNotionTemplate}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                      >
                        {copiedIndex === 9998 ? <Check size={16} /> : <Copy size={16} />}
                        {copiedIndex === 9998 ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={downloadNotionTemplate}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
                        title="Download as markdown file"
                      >
                        <Download size={16} />
                        Download .md
                      </button>
                      <a
                        href={`data:text/markdown;charset=utf-8,${encodeURIComponent(
                          generatedContent.notionTemplate
                            ? (() => {
                                const template = generatedContent.notionTemplate;
                                let notionText = `# ${template.title}\n\n## Properties\n`;
                                Object.entries(template.properties).forEach(([key, value]) => {
                                  notionText += `- **${key}**: ${value}\n`;
                                });
                                notionText += '\n';
                                template.sections.forEach(section => {
                                  notionText += `## ${section.title}\n${section.content}\n\n`;
                                });
                                return notionText;
                              })()
                            : ''
                        )}`}
                        download={`${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_notion_template.md`}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                        title="Alternative download method"
                      >
                        <Download size={16} />
                        Alt Download
                      </a>
                    </div>
                  </div>
                  
                  {generatedContent.notionTemplate && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Project Properties</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(generatedContent.notionTemplate.properties).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value.toString()}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border max-h-64 overflow-y-auto">
                        {generatedContent.notionTemplate.sections.map((section, idx) => (
                          <div key={idx} className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{section.content}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Character References */}
            {selectedPhase === 'character_refs' && (
              <div className="space-y-6">
                {generatedContent.characterPrompts.map((prompt, index) => (
                  <div key={index} className="border rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Character: {prompt.character}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          Midjourney V7
                        </span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                          {subgenres.find(s => s.id === selectedSubgenre)?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-gray-700">Subgenre-Optimized Midjourney Prompt:</label>
                        <button
                          onClick={() => copyToClipboard(prompt.midjourneyPrompt, index)}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={prompt.midjourneyPrompt}
                        readOnly
                        className="w-full h-24 p-3 bg-white border rounded-lg text-sm resize-none"
                      />
                    </div>
                    
                    {/* Character Details */}
                    {prompt.characterDetails && (
                      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Character Arc:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {prompt.characterDetails.want && (
                            <div><span className="font-medium">Want:</span> {prompt.characterDetails.want}</div>
                          )}
                          {prompt.characterDetails.need && (
                            <div><span className="font-medium">Need:</span> {prompt.characterDetails.need}</div>
                          )}
                          {prompt.characterDetails.wound && (
                            <div><span className="font-medium">Wound:</span> {prompt.characterDetails.wound}</div>
                          )}
                          {prompt.characterDetails.lie && (
                            <div><span className="font-medium">Lie:</span> {prompt.characterDetails.lie}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Runway Tag:</h4>
                        <code className="bg-yellow-100 px-2 py-1 rounded text-sm">{prompt.personalizedTags}</code>
                        {prompt.role && (
                          <p className="text-xs text-gray-600 mt-1">Role: {prompt.role}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">{subgenres.find(s => s.id === selectedSubgenre)?.name} Outfits:</h4>
                        <ul className="text-sm text-gray-600">
                          {prompt.subgenreSpecific.outfits.map((outfit, idx) => (
                            <li key={idx}>• {outfit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Expressions:</h4>
                        <ul className="text-sm text-gray-600">
                          {prompt.subgenreSpecific.expressions.map((expr, idx) => (
                            <li key={idx}>• {expr}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Environment References */}
            {selectedPhase === 'environment_refs' && (
              <div className="space-y-6">
                {generatedContent.environmentPrompts.map((prompt, index) => (
                  <div key={index} className="border rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Environment: {prompt.environment}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Midjourney V7
                        </span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                          {subgenres.find(s => s.id === selectedSubgenre)?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-gray-700">Subgenre-Styled Environment Prompt:</label>
                        <button
                          onClick={() => copyToClipboard(prompt.midjourneyPrompt, index)}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                          Copy
                        </button>
                      </div>
                      <textarea
                        value={prompt.midjourneyPrompt}
                        readOnly
                        className="w-full h-24 p-3 bg-white border rounded-lg text-sm resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Runway Tag:</h4>
                        <code className="bg-yellow-100 px-2 py-1 rounded text-sm">{prompt.personalizedTags}</code>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Subgenre Elements:</h4>
                        <ul className="text-sm text-gray-600">
                          {prompt.subgenreElements.map((element, idx) => (
                            <li key={idx}>• {element}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Lighting Variations:</h4>
                        <ul className="text-sm text-gray-600">
                          {prompt.variations.map((variation, idx) => (
                            <li key={idx}>• {variation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shot Generation */}
            {selectedPhase === 'shot_generation' && (
              <div className="space-y-6">
                {generatedContent.shotPrompts.map((prompt, index) => (
                  <div key={index} className="border rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Shot {prompt.shotNumber}: {prompt.shotType} - {prompt.emotion}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                          Runway
                        </span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                          {subgenres.find(s => s.id === selectedSubgenre)?.name}
                        </span>
                      </div>
                    </div>
                    
                    {prompt.characters && prompt.characters.length > 0 && (
                      <p className="text-gray-600 mb-2">Characters: {prompt.characters.join(', ')}</p>
                    )}
                    
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">{prompt.description}</p>
                      {prompt.voiceover && (
                        <p className="text-sm text-purple-600 italic mb-2">V.O.: "{prompt.voiceover}"</p>
                      )}
                      <div className="flex gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {prompt.shotType}
                        </span>
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">
                          {prompt.emotion}
                        </span>
                        {prompt.isDialogue && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            dialogue
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-gray-700">Subgenre-Enhanced Runway Prompt:</label>
                        <button
                          onClick={() => copyToClipboard(prompt.runwayPrompt, index)}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                          Copy
                        </button>
                      </div>
                      <textarea
                        value={prompt.runwayPrompt}
                        readOnly
                        className="w-full h-20 p-3 bg-white border rounded-lg text-sm resize-none"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">💡 {prompt.technicalNotes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Video Generation */}
            {selectedPhase === 'video_generation' && (
              <div className="space-y-6">
                {generatedContent.videoPrompts.map((prompt, index) => (
                  <div key={index} className="border rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Video Shot {prompt.shotNumber}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Kling AI</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Veo 3</span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                          {subgenres.find(s => s.id === selectedSubgenre)?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {prompt.characters && prompt.characters.length > 0 && (
                        <p className="text-gray-600 mb-2">Characters: {prompt.characters.join(', ')}</p>
                      )}
                      {prompt.voiceover && (
                        <p className="text-sm text-purple-600 italic mb-2">V.O.: "{prompt.voiceover}"</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-medium text-gray-700">Kling AI Prompt:</label>
                          <button
                            onClick={() => copyToClipboard(prompt.klingPrompt, index * 2)}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy size={14} /> Copy
                          </button>
                        </div>
                        <textarea
                          value={prompt.klingPrompt}
                          readOnly
                          className="w-full h-24 p-3 bg-white border rounded-lg text-sm resize-none"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-medium text-gray-700">Veo 3 Prompt:</label>
                          <button
                            onClick={() => copyToClipboard(prompt.veoPrompt, index * 2 + 1)}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy size={14} /> Copy
                          </button>
                        </div>
                        <textarea
                          value={prompt.veoPrompt}
                          readOnly
                          className="w-full h-24 p-3 bg-white border rounded-lg text-sm resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Presets:</span> {prompt.presets.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {prompt.duration}
                        </div>
                        <div>
                          <span className="font-medium">Subgenre Notes:</span> {prompt.subgenreNotes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Runway References */}
            {selectedPhase === 'runway_refs' && (
              <div className="space-y-6">
                {generatedContent.runwayReferences.map((ref, index) => (
                  <div key={index} className="border rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {ref.type === 'character' ? '👤' : '🏞️'} {ref.name}
                      </h3>
                      <div className="flex gap-2">
                        <code className="bg-yellow-100 px-2 py-1 rounded text-sm">{ref.tag}</code>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                          {subgenres.find(s => s.id === selectedSubgenre)?.name}
                        </span>
                      </div>
                    </div>
                    
                    {ref.type === 'character' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Subgenre-Specific Outfits:</h4>
                          <ul className="text-sm text-gray-600">
                            {ref.extraOutfits.map((outfit, idx) => (
                              <li key={idx}>• {outfit}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Expressions:</h4>
                          <ul className="text-sm text-gray-600">
                            {ref.expressions.map((expr, idx) => (
                              <li key={idx}>• {expr}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {ref.type === 'environment' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Environmental Variations:</h4>
                          <ul className="text-sm text-gray-600">
                            {ref.variations.map((variation, idx) => (
                              <li key={idx}>• {variation}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Subgenre Elements:</h4>
                          <ul className="text-sm text-gray-600">
                            {ref.subgenreElements.map((element, idx) => (
                              <li key={idx}>• {element}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Export All Button */}
            {generatedContent.characterPrompts.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={exportAllPrompts}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center gap-2 transform hover:scale-105 transition-all"
                >
                  <Download size={20} />
                  Export All Prompts as Text File
                </button>
              </div>
            )}
            
            {/* Workflow Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Sparkles className="text-purple-500" />
                Complete AI Artist Workflow - {subgenres.find(s => s.id === selectedSubgenre)?.name}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>📋 Download Folder Structure & Notion Template</li>
                <li>🎯 Setup Claude Project with {subgenres.find(s => s.id === selectedSubgenre)?.name} Guidelines</li>
                <li>👥 Generate Character References (4-5 per character) with Subgenre-Style</li>
                <li>🏞️ Generate Environment References with {subgenres.find(s => s.id === selectedSubgenre)?.visualStyle} Aesthetic</li>
                <li>✅ Producer Review - References</li>
                <li>🎬 Batch 1: Shots 1-5 with Tagged References</li>
                <li>📋 Producer Approval before next Batch</li>
                <li>🎥 Video Generation: Kling + Veo3 with {subgenres.find(s => s.id === selectedSubgenre)?.name} Presets</li>
                <li>🎨 Post-Production with Subgenre-specific Elements</li>
                <li>🧠 Brain Trust Review before Final Delivery</li>
              </ol>
              
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">📊 Estimated Time Savings:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><strong>Setup:</strong> 3h → 15min</div>
                  <div><strong>References:</strong> 6h → 30min</div>
                  <div><strong>Shot Prompts:</strong> 4h → 10min</div>
                  <div><strong>Video Prompts:</strong> 3h → 15min</div>
                </div>
                <p className="text-center mt-2 font-bold text-purple-700">Total: 16 hours → 70 minutes (93% time saved!)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITrailerAutomationPro;
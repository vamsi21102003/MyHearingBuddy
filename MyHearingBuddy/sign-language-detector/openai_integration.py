"""
OpenAI Integration for Sign Language Detection
This file contains the OpenAI API integration that can be used with the main inference script.
Enhanced with smart word prediction and frequency-based completion.
"""

from openai import OpenAI
import os
from typing import Optional, List, Dict
import re

class OpenAIIntegrator:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI client and text-to-speech engine
        Args:
            api_key: OpenAI API key. If None, will try to get from environment variable
        """
        # Set API key
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=api_key)
        
        # Note: TTS is handled on the client side (React Native app)
        # Server only handles text completion
        
        # Common word completions based on frequency
        self.common_completions = {
            # Sign language specific patterns
            'HY': ['Hi'],
            'HK': ['Hi'], 
            'HJ': ['Hi'],
            'HA': ['Hi'],
            'HB': ['Hi'],
            'HC': ['Hi'],
            'HD': ['Hi'],
            'HE': ['Hi'],  # Note: HE could also be "He" but Hi is more common in greetings
            'HF': ['Hi'],
            'HG': ['Hi'],
            'HH': ['Hi'],
            'HI': ['Hi'],  # Direct match
            'HL': ['Hi'],
            'HM': ['Hi'],
            'HN': ['Hi'],
            'HO': ['Hi'],
            'HP': ['Hi'],
            'HQ': ['Hi'],
            'HR': ['Hi'],
            'HS': ['Hi'],
            'HT': ['Hi'],
            'HU': ['Hi'],
            'HV': ['Hi'],
            'HW': ['Hi'],
            'HX': ['Hi'],
            'HZ': ['Hi'],
            
            # Most frequent English words and their completions
            'TH': ['the', 'that', 'this', 'they', 'them', 'then', 'there', 'think'],
            'AN': ['and', 'any', 'answer'],
            'WH': ['what', 'when', 'where', 'who', 'why', 'which', 'while'],
            'YOU': ['you', 'your', 'yours'],
            'HEL': ['help', 'hello'],
            'HAV': ['have', 'having'],
            'WOR': ['work', 'world', 'word', 'worry'],
            'GOO': ['good', 'goodbye'],
            'HOM': ['home'],
            'TIM': ['time'],
            'DAY': ['day'],
            'WAY': ['way'],
            'MAN': ['man', 'many'],
            'NEW': ['new', 'news'],
            'OLD': ['old'],
            'SEE': ['see', 'seem'],
            'HIM': ['him'],
            'TWO': ['two'],
            'HOW': ['how'],
            'ITS': ['its'],
            'WHO': ['who'],
            'OIL': ['oil'],
            'SIT': ['sit'],
            'SET': ['set'],
            'RUN': ['run'],
            'EAT': ['eat'],
            'FAR': ['far'],
            'SEA': ['sea'],
            'EYE': ['eye'],
            'CAR': ['car', 'care'],
            'BIG': ['big'],
            'BOX': ['box'],
            'YES': ['yes'],
            'YET': ['yet'],
            'JOB': ['job'],
            'LOT': ['lot', 'love'],
            'FEW': ['few'],
            'MAY': ['may'],
            'SAY': ['say'],
            'SHE': ['she'],
            'USE': ['use', 'used'],
            'HER': ['her', 'here'],
            'NOW': ['now'],
            'FIN': ['find', 'fine'],
            'ONL': ['only'],
            'HIS': ['his'],
            'HAD': ['had'],
            'LET': ['let'],
            'PUT': ['put'],
            'TOO': ['too', 'took'],
            'ANY': ['any'],
            'APP': ['apple', 'application'],
            'ASK': ['ask'],
            'BAD': ['bad'],
            'BED': ['bed'],
            'BOY': ['boy'],
            'BUY': ['buy'],
            'CAN': ['can', 'cannot'],
            'CUT': ['cut'],
            'DID': ['did'],
            'DOG': ['dog'],
            'END': ['end'],
            'GET': ['get'],
            'GOT': ['got'],
            'HAP': ['happy', 'happen'],
            'HEA': ['head', 'hear', 'heart', 'health'],
            'HUN': ['hungry', 'hundred'],
            'IMP': ['important'],
            'KNO': ['know'],
            'LAR': ['large'],
            'LEA': ['learn', 'leave'],
            'LIK': ['like'],
            'LIV': ['live'],
            'LOO': ['look'],
            'MAK': ['make'],
            'MEE': ['meet'],
            'MOR': ['more', 'morning'],
            'MOV': ['move'],
            'NEE': ['need'],
            'NIG': ['night'],
            'OPE': ['open'],
            'PLA': ['place', 'play'],
            'REA': ['read', 'ready', 'real'],
            'RIG': ['right'],
            'SCH': ['school'],
            'SMA': ['small'],
            'SOM': ['some', 'something'],
            'STA': ['start', 'state'],
            'STU': ['study', 'student'],
            'TAK': ['take'],
            'TEL': ['tell'],
            'THA': ['thank', 'that'],
            'THI': ['think', 'this'],
            'TRY': ['try'],
            'TUR': ['turn'],
            'UND': ['understand'],
            'VER': ['very'],
            'WAI': ['wait'],
            'WAN': ['want'],
            'WAT': ['watch', 'water'],
            'WEL': ['well', 'welcome'],
            'WIL': ['will'],
            'WIT': ['with', 'without'],
            'WRI': ['write'],
            'YEA': ['year', 'yeah'],
        }
    
    def speak_text(self, text: str):
        """
        Placeholder for text-to-speech functionality
        Note: TTS is now handled on the client side (React Native app)
        Args:
            text: Text to be spoken (logged only)
        """
        print(f"📱 Text for client TTS: {text}")
        # TTS is handled on the React Native app, not on the server
    
    def _is_complete_text(self, text: str) -> bool:
        """
        Check if the text is already complete and doesn't need prediction
        Args:
            text: Input text to check
        Returns:
            True if text is complete, False if needs completion
        """
        text_upper = text.upper().strip()
        
        # List of complete words that should not be modified
        complete_words = {
            # Common complete words
            'HI', 'HELLO', 'BYE', 'YES', 'NO', 'OK', 'OKAY', 'THANKS', 'THANK', 'PLEASE',
            'GOOD', 'BAD', 'NICE', 'GREAT', 'FINE', 'WELL', 'BEST', 'LOVE', 'LIKE',
            'HELP', 'STOP', 'GO', 'COME', 'SEE', 'LOOK', 'HEAR', 'FEEL', 'KNOW',
            'WANT', 'NEED', 'HAVE', 'GET', 'GIVE', 'TAKE', 'MAKE', 'DO', 'BE',
            'I', 'YOU', 'HE', 'SHE', 'WE', 'THEY', 'IT', 'ME', 'HIM', 'HER', 'US', 'THEM',
            'MY', 'YOUR', 'HIS', 'HER', 'OUR', 'THEIR', 'THIS', 'THAT', 'THESE', 'THOSE',
            'THE', 'A', 'AN', 'AND', 'OR', 'BUT', 'SO', 'IF', 'WHEN', 'WHERE', 'WHY', 'HOW',
            'WHO', 'WHAT', 'WHICH', 'WHOSE', 'WHOM', 'IS', 'ARE', 'WAS', 'WERE', 'WILL',
            'CAN', 'COULD', 'SHOULD', 'WOULD', 'MAY', 'MIGHT', 'MUST', 'SHALL',
            'HOME', 'WORK', 'SCHOOL', 'FOOD', 'WATER', 'TIME', 'DAY', 'NIGHT',
            'MOM', 'DAD', 'FAMILY', 'FRIEND', 'BABY', 'CHILD', 'MAN', 'WOMAN',
            'HOT', 'COLD', 'BIG', 'SMALL', 'FAST', 'SLOW', 'NEW', 'OLD', 'YOUNG',
            'RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE', 'BROWN', 'PINK',
            'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'
        }
        
        # Check if it's a single complete word
        words = text_upper.split()
        if len(words) == 1:
            return words[0] in complete_words
        
        # For multiple words, check if all words are complete
        # This prevents modification of phrases like "HI THERE" 
        return all(word in complete_words for word in words)

    def _clean_input_text(self, text: str) -> str:
        """
        Clean input text by removing excessive repeated characters and extra spaces
        Args:
            text: Raw input text
        Returns:
            Cleaned text
        """
        if not text:
            return text
        
        # Remove excessive repeated characters (more than 2 in a row)
        # HHHHEEEELLLLLLOOOO -> HELLO
        cleaned = re.sub(r'(.)\1{2,}', r'\1', text)
        
        # Remove excessive spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        
        # Strip leading/trailing spaces
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _predict_word_locally(self, partial_word: str) -> str:
        """
        Predict word completion using local frequency-based dictionary
        Args:
            partial_word: Partial word to complete
        Returns:
            Most likely completion
        """
        partial_upper = partial_word.upper()
        
        # Special sign language pattern: H + any letter(s) = Hi
        if len(partial_upper) >= 2 and partial_upper.startswith('H') and partial_upper != 'HE':
            # Check if it's H followed by any letters (but not common words like "HELLO", "HELP", etc.)
            if not any(partial_upper.startswith(word) for word in ['HEL', 'HER', 'HIM', 'HIS', 'HOW', 'HOM']):
                return 'Hi'
        
        # Direct match
        if partial_upper in self.common_completions:
            return self.common_completions[partial_upper][0]  # Return most common
        
        # Prefix match
        for key, completions in self.common_completions.items():
            if key.startswith(partial_upper) and len(partial_upper) >= 2:
                return completions[0]
        
        # Fallback: return original
        return partial_word
    
    def _try_local_completion(self, text: str) -> str:
        """
        Try to complete text using local frequency-based predictions
        Args:
            text: Input text to complete
        Returns:
            Completed text or original if no completion found
        """
        words = text.strip().split()
        if not words:
            return text
        
        # Check if last word is already complete and should not be changed
        last_word = words[-1].upper()
        
        # CRITICAL: If the word is "HI", never change it to anything else
        if last_word == 'HI':
            # Replace with properly formatted "Hi" and return immediately
            words[-1] = 'Hi'
            return ' '.join(words)
        
        # List of other complete words that should not be modified
        complete_words = {'HELLO', 'YES', 'NO', 'THANKS', 'PLEASE', 'GOOD', 'BAD', 'OKAY', 'OK'}
        if last_word in complete_words:
            # Just format properly and return
            words[-1] = last_word.capitalize()
            return ' '.join(words)
        
        # Try to complete the last word only if it's not already complete
        completed_word = self._predict_word_locally(last_word)
        
        if completed_word.upper() != last_word:
            # Replace last word with completion
            words[-1] = completed_word.lower()
            completed_text = ' '.join(words)
            # Capitalize first letter
            if completed_text:
                completed_text = completed_text[0].upper() + completed_text[1:] if len(completed_text) > 1 else completed_text.upper()
            return completed_text
        
        return text
    
    def _clean_completion(self, original: str, completed: str) -> str:
        """
        Clean the completion to ensure it doesn't add unnecessary extra content
        Args:
            original: Original partial text
            completed: AI completed text
        Returns:
            Cleaned completion
        """
        # Convert to lowercase for comparison
        original_lower = original.lower().strip()
        completed_lower = completed.lower().strip()
        
        # If the completion is much longer than expected, truncate it
        original_words = original_lower.split()
        completed_words = completed_lower.split()
        
        # Allow at most 2 additional words beyond the original
        max_additional_words = 2
        if len(completed_words) > len(original_words) + max_additional_words:
            # Truncate to reasonable length
            truncated_words = completed_words[:len(original_words) + max_additional_words]
            completed = ' '.join(truncated_words)
        
        # Capitalize first letter
        if completed:
            completed = completed[0].upper() + completed[1:] if len(completed) > 1 else completed.upper()
        
        return completed
    
    def complete_sentence(self, partial_text: str) -> str:
        """
        Send partial text to OpenAI to complete the sentence with smart word prediction
        Args:
            partial_text: The partial sentence from sign language detection
        Returns:
            Completed sentence from OpenAI
        """
        try:
            # Clean the input text first
            cleaned_text = self._clean_input_text(partial_text)
            print(f"🧹 Cleaned text: '{cleaned_text}'")
            
            # If text is too messy or empty after cleaning, return a helpful message
            if not cleaned_text or len(cleaned_text) < 2:
                result = "Please try again with clearer gestures"
                return result
            
            # Check if the text is already complete (no prediction needed)
            if self._is_complete_text(cleaned_text):
                print(f"🎯 Text is already complete: '{cleaned_text}'")
                # Just format it properly (capitalize first letter)
                formatted_text = cleaned_text.lower()
                if formatted_text:
                    formatted_text = formatted_text[0].upper() + formatted_text[1:] if len(formatted_text) > 1 else formatted_text.upper()
                return formatted_text
            
            # First, try local prediction for quick common words
            local_prediction = self._try_local_completion(cleaned_text)
            if local_prediction != cleaned_text:
                print(f"🔍 Local prediction: {local_prediction}")
                return local_prediction
            
            # If local prediction doesn't help, use OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": """You are an intelligent word completion assistant for sign language input. Your job is to predict and complete incomplete words and sentences.

                        CORE RULES:
                        - ONLY complete the given text, do NOT add extra words or sentences
                        - If a word is already COMPLETE and CORRECT, do NOT change it
                        - Focus on completing the LAST incomplete word first
                        - If all words seem complete, return the text as-is
                        - Fix obvious spelling errors
                        - Use common, everyday words (avoid rare/technical terms)
                        - Consider context from previous words
                        - If input seems garbled or unclear, try to find the intended word
                        
                        COMPLETE WORDS - DO NOT MODIFY:
                        - "HI" is complete → return "Hi" (do NOT change to "Him")
                        - "HELLO" is complete → return "Hello" 
                        - "YES" is complete → return "Yes"
                        - "NO" is complete → return "No"
                        - "THANKS" is complete → return "Thanks"
                        - Any other complete English words should remain unchanged
                        
                        SIGN LANGUAGE SPECIFIC PATTERNS:
                        - "H" + any letter(s) (HY, HK, HJ, HA, HB, etc.) → "Hi" (greeting)
                        - This is a common sign language input pattern where "H" gets combined with accidental letters
                        - BUT if input is exactly "HI", keep it as "Hi" (already complete)
                        
                        WORD PREDICTION STRATEGIES:
                        1. Check if word is already complete first
                        2. Complete partial words based on common patterns
                        3. Prioritize high-frequency English words
                        4. Consider word context and grammar
                        5. Avoid uncommon or technical vocabulary
                        6. If multiple completions possible, choose the most common one
                        7. Clean up garbled input to find intended words
                        8. Recognize sign language input patterns (H + letters = Hi)
                        
                        EXAMPLES:
                        Input: "HI" → Output: "Hi" (already complete, don't change)
                        Input: "HELLO" → Output: "Hello" (already complete, don't change)
                        Input: "YES" → Output: "Yes" (already complete, don't change)
                        Input: "HY" → Output: "Hi" (sign language pattern)
                        Input: "HK" → Output: "Hi" (sign language pattern)
                        Input: "HJ" → Output: "Hi" (sign language pattern)
                        Input: "I WANT TO GO TO TH" → Output: "I want to go to the"
                        Input: "HOW AR YOU" → Output: "How are you"
                        Input: "WHAT IS YOUR NAM" → Output: "What is your name"
                        Input: "I AM HUNDR" → Output: "I am hungry" (not "hundred")
                        Input: "CAN YOU HEL" → Output: "Can you help"
                        Input: "GOOD MORN" → Output: "Good morning"
                        Input: "THANK Y" → Output: "Thank you"
                        Input: "HELO" → Output: "Hello"
                        
                        FREQUENCY-BASED COMPLETION:
                        - Complete words like "HI", "YES", "NO" → Keep as-is
                        - "H" + any letters → "Hi" (sign language greeting pattern)
                        - "TH" → "the" (most common)
                        - "AN" → "and" (very common)
                        - "YOU" → complete as-is
                        - "WH" → "what", "when", "where" (choose based on context)
                        - "HEL" → "help" (more common than "hello" in most contexts)
                        
                        Return ONLY the completed text, nothing else."""
                    },
                    {
                        "role": "user", 
                        "content": cleaned_text
                    }
                ],
                max_tokens=30,  # Reduced to prevent adding extra words
                temperature=0.1,  # Very low temperature for consistent, predictable completions
                frequency_penalty=0.5,  # Reduce repetition
                presence_penalty=0.3   # Encourage diverse but relevant completions
            )
            
            completed_sentence = response.choices[0].message.content.strip()
            
            # Additional post-processing to ensure we don't add extra content
            completed_sentence = self._clean_completion(cleaned_text, completed_sentence)
            
            return completed_sentence
            
        except Exception as e:
            # Fallback to local prediction if OpenAI fails
            try:
                cleaned_text = self._clean_input_text(partial_text)
                local_fallback = self._try_local_completion(cleaned_text)
                if local_fallback != cleaned_text and cleaned_text:
                    print(f"🔄 Using local fallback: {local_fallback}")
                    return local_fallback
            except:
                pass
            
            error_msg = f"Error: {str(e)}"
            print(f"❌ OpenAI Error: {error_msg}")
            return partial_text  # Return original if all fails

# Simple function for easy import
def process_text(text: str) -> str:
    """
    Simple function to process text with OpenAI and speak the result
    Args:
        text: The text to process
    Returns:
        Completed sentence
    """
    try:
        ai = OpenAIIntegrator()
        return ai.complete_sentence(text)
    except Exception as e:
        error_msg = f"OpenAI Error: {str(e)}"
        print(f"❌ {error_msg}")
        return error_msg

# Example usage:
if __name__ == "__main__":
    # Test the integration
    try:
        ai = OpenAIIntegrator()
        
        # Test sentence completion with new smart prediction
        test_texts = [
            "HELLO WOR",      # Should complete to "Hello world"
            "I WANT TO GO TO TH",  # Should complete to "I want to go to the"
            "HOW AR YOU",     # Should complete to "How are you"
            "WHAT IS YOUR NAM",    # Should complete to "What is your name"
            "CAN YOU HEL",    # Should complete to "Can you help"
            "GOOD MORN",      # Should complete to "Good morning"
            "THANK Y",        # Should complete to "Thank you"
            "I AM HUN",       # Should complete to "I am hungry"
            "WH",             # Should complete to "What" (most common)
            "TH",             # Should complete to "The"
            "AN",             # Should complete to "And"
            "HHHHEEEELLLLLLOOOO",  # Should clean to "HELLO"
        ]
        
        for test_text in test_texts:
            print(f"\nTesting: '{test_text}'")
            result = ai.complete_sentence(test_text)
            print(f"Completed: '{result}'")
        
        print("\n✅ OpenAI integration test completed!")
        
    except Exception as e:
        print(f"❌ Setup error: {e}")
        print("Make sure to install required packages:")
        print("pip install openai pyttsx3")
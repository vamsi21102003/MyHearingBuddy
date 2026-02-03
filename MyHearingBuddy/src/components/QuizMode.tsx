import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { colors, typography, spacing, borderRadius, elevation } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { ISL_ALPHABET } from '../utils/constants';

interface QuizQuestion {
  correctAnswer: string;
  options: string[];
}

const QuizMode: React.FC = () => {
  const { practiceProgress, updateProgress } = useAppContext();
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && !currentQuestion) {
      generateQuestion();
    }
  }, [quizStarted, currentQuestion]);

  const generateQuestion = () => {
    // Select a random letter
    const correctAnswer = ISL_ALPHABET[Math.floor(Math.random() * ISL_ALPHABET.length)];
    
    // Generate 3 wrong options
    const wrongOptions: string[] = [];
    while (wrongOptions.length < 3) {
      const randomLetter = ISL_ALPHABET[Math.floor(Math.random() * ISL_ALPHABET.length)];
      if (randomLetter !== correctAnswer && !wrongOptions.includes(randomLetter)) {
        wrongOptions.push(randomLetter);
      }
    }

    // Shuffle all options
    const allOptions = [correctAnswer, ...wrongOptions];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      correctAnswer,
      options: shuffledOptions,
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Update progress for the letter
    if (currentQuestion) {
      const currentProgress = practiceProgress.find(p => p.letter === currentQuestion.correctAnswer);
      if (currentProgress) {
        const newAttempts = currentProgress.attempts + 1;
        const newAccuracy = isCorrect 
          ? ((currentProgress.accuracy * currentProgress.attempts) + 100) / newAttempts
          : (currentProgress.accuracy * currentProgress.attempts) / newAttempts;
        
        await updateProgress(currentQuestion.correctAnswer, {
          attempts: newAttempts,
          accuracy: newAccuracy,
          mastered: newAccuracy >= 80 && newAttempts >= 3,
        });
      }
    }

    setQuestionCount(prev => prev + 1);

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      if (questionCount < 9) { // 10 questions total
        generateQuestion();
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    const percentage = Math.round((score / 10) * 100);
    Alert.alert(
      'Quiz Complete!',
      `You scored ${score}/10 (${percentage}%)\n\n${getScoreMessage(percentage)}`,
      [
        { text: 'Try Again', onPress: startQuiz },
        { text: 'Done', onPress: () => setQuizStarted(false) },
      ]
    );
  };

  const getScoreMessage = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent! You\'re an ISL master! 🏆';
    if (percentage >= 80) return 'Great job! Keep practicing! ⭐';
    if (percentage >= 70) return 'Good work! You\'re improving! 👍';
    if (percentage >= 60) return 'Not bad! More practice needed! 📚';
    return 'Keep learning! Practice makes perfect! 💪';
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setScore(0);
    setQuestionCount(0);
    setCurrentQuestion(null);
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option ? styles.optionSelected : styles.option;
    }

    if (option === currentQuestion?.correctAnswer) {
      return styles.optionCorrect;
    } else if (option === selectedAnswer) {
      return styles.optionWrong;
    } else {
      return styles.optionDisabled;
    }
  };

  const getOptionTextStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option ? styles.optionTextSelected : styles.optionText;
    }

    if (option === currentQuestion?.correctAnswer) {
      return styles.optionTextCorrect;
    } else if (option === selectedAnswer) {
      return styles.optionTextWrong;
    } else {
      return styles.optionTextDisabled;
    }
  };

  if (!quizStarted) {
    return (
      <View style={styles.startContainer}>
        <Animatable.View animation="bounceIn" style={styles.startContent}>
          <MaterialIcons name="quiz" size={64} color={colors.primary} />
          <Text style={styles.startTitle}>ISL Quiz Challenge</Text>
          <Text style={styles.startSubtitle}>
            Test your knowledge of Indian Sign Language alphabet with 10 random questions!
          </Text>
          
          <View style={styles.quizInfo}>
            <View style={styles.infoItem}>
              <MaterialIcons name="help" size={20} color={colors.primary} />
              <Text style={styles.infoText}>10 Questions</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="timer" size={20} color={colors.primary} />
              <Text style={styles.infoText}>No Time Limit</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="school" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Learn & Improve</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={startQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Quiz</Text>
            <MaterialIcons name="play-arrow" size={24} color={colors.surface} />
          </TouchableOpacity>
        </Animatable.View>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={1000}
        >
          <MaterialIcons name="refresh" size={48} color={colors.primary} />
        </Animatable.View>
        <Text style={styles.loadingText}>Preparing question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.questionNumber}>
          Question {questionCount + 1} of 10
        </Text>
        <Text style={styles.scoreText}>
          Score: {score}/{questionCount}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((questionCount + 1) / 10) * 100}%` }
          ]}
        />
      </View>

      {/* Question */}
      <Animatable.View animation="fadeIn" style={styles.questionContainer}>
        <Text style={styles.questionTitle}>
          Which letter does this gesture represent?
        </Text>
        
        {/* Gesture Display */}
        <View style={styles.gestureDisplay}>
          <MaterialIcons name="pan-tool" size={80} color={colors.primary} />
          <Text style={styles.gestureText}>
            ISL Gesture for "{currentQuestion.correctAnswer}"
          </Text>
          <Text style={styles.gestureHint}>
            (In a real app, this would show the actual gesture image)
          </Text>
        </View>
      </Animatable.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <Animatable.View
            key={option}
            animation="fadeInUp"
            delay={index * 100}
          >
            <TouchableOpacity
              style={getOptionStyle(option)}
              onPress={() => handleAnswerSelect(option)}
              disabled={showResult}
              activeOpacity={0.8}
            >
              <Text style={getOptionTextStyle(option)}>
                {option}
              </Text>
              
              {showResult && option === currentQuestion.correctAnswer && (
                <MaterialIcons name="check-circle" size={24} color={colors.surface} />
              )}
              
              {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                <MaterialIcons name="cancel" size={24} color={colors.surface} />
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>

      {/* Result Message */}
      {showResult && (
        <Animatable.View animation="bounceIn" style={styles.resultContainer}>
          <MaterialIcons
            name={selectedAnswer === currentQuestion.correctAnswer ? 'check-circle' : 'cancel'}
            size={32}
            color={selectedAnswer === currentQuestion.correctAnswer ? colors.success : colors.error}
          />
          <Text style={[
            styles.resultText,
            {
              color: selectedAnswer === currentQuestion.correctAnswer ? colors.success : colors.error
            }
          ]}>
            {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect!'}
          </Text>
          {selectedAnswer !== currentQuestion.correctAnswer && (
            <Text style={styles.correctAnswerText}>
              The correct answer is: {currentQuestion.correctAnswer}
            </Text>
          )}
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  startContent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    elevation: elevation.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  startTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  startSubtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  quizInfo: {
    marginBottom: spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  startButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.surface,
    marginRight: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumber: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  scoreText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.xl,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  questionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  gestureDisplay: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    elevation: elevation.sm,
  },
  gestureText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  gestureHint: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginBottom: spacing.xl,
  },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.overlay,
    borderColor: colors.primary,
  },
  optionCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  optionDisabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.6,
  },
  optionText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionTextCorrect: {
    color: colors.surface,
  },
  optionTextWrong: {
    color: colors.surface,
  },
  optionTextDisabled: {
    color: colors.textSecondary,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: elevation.sm,
  },
  resultText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  correctAnswerText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default QuizMode;
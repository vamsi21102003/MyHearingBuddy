import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FAB } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

import { DetectionResult, OpenAICompletion } from '../../types';
import { colors, typography, spacing, borderRadius, elevation } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';
import HistoryItem from '../../components/HistoryItem';
import EmptyState from '../../components/EmptyState';

interface CombinedHistoryItem {
  id: string;
  type: 'detection' | 'completion';
  timestamp: number;
  data: DetectionResult | OpenAICompletion;
}

const HistoryScreen: React.FC = () => {
  const { 
    detectionHistory, 
    openaiCompletions, 
    clearHistory, 
    clearOpenAICompletions,
    getDatabaseStats 
  } = useAppContext();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completions'>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  // Combine and sort history items
  const getCombinedHistory = (): CombinedHistoryItem[] => {
    const detectionItems: CombinedHistoryItem[] = detectionHistory.map(item => ({
      id: item.id,
      type: 'detection',
      timestamp: item.timestamp,
      data: item
    }));

    const completionItems: CombinedHistoryItem[] = openaiCompletions.map(item => ({
      id: item.id,
      type: 'completion',
      timestamp: item.timestamp,
      data: item
    }));

    const combined = [...detectionItems, ...completionItems];
    
    // Filter based on selected filter
    const filtered = combined.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'completions') return item.type === 'completion';
      return true;
    });

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await clearHistory();
              await clearOpenAICompletions();
              await loadStats();
              setIsSelectionMode(false);
              setSelectedItems(new Set());
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleItemPress = (item: CombinedHistoryItem) => {
    if (isSelectionMode) {
      toggleItemSelection(item.id);
    } else {
      showItemDetails(item);
    }
  };

  const handleItemLongPress = (item: CombinedHistoryItem) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems(new Set([item.id]));
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);

    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const showItemDetails = (item: CombinedHistoryItem) => {
    const formattedTime = new Date(item.timestamp).toLocaleString();

    if (item.type === 'detection') {
      const detection = item.data as DetectionResult;
      const confidencePercentage = Math.round(detection.confidence * 100);
      Alert.alert(
        `Sign Detection: ${detection.letter}`,
        `Detected at: ${formattedTime}\nConfidence: ${confidencePercentage}%\nSource: ${detection.source}`,
        [{ text: 'OK' }]
      );
    } else {
      const completion = item.data as OpenAICompletion;
      Alert.alert(
        'AI Text Completion',
        `Completed at: ${formattedTime}\n\nOriginal: "${completion.original_text}"\n\nCompleted: "${completion.completed_text}"`,
        [{ text: 'OK' }]
      );
    }
  };

  const deleteSelectedItems = () => {
    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedItems.size} selected item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // Note: In a real app, you'd implement selective deletion
            // For now, we'll just clear selection
            setSelectedItems(new Set());
            setIsSelectionMode(false);
          }
        },
      ]
    );
  };

  const combinedHistory = getCombinedHistory();

  const selectAll = () => {
    const allIds = new Set(combinedHistory.map(item => item.id));
    setSelectedItems(allIds);
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const renderHistoryItem = ({ item, index }: { item: CombinedHistoryItem; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 50}
      duration={300}
    >
      {item.type === 'detection' ? (
        <HistoryItem
          item={item.data as DetectionResult}
          isSelected={selectedItems.has(item.id)}
          isSelectionMode={isSelectionMode}
          onPress={() => handleItemPress(item)}
          onLongPress={() => handleItemLongPress(item)}
        />
      ) : (
        <View style={styles.completionItem}>
          <View style={styles.completionHeader}>
            <View style={styles.completionIcon}>
              <MaterialIcons name="auto-fix-high" size={20} color={colors.secondary} />
            </View>
            <View style={styles.completionInfo}>
              <Text style={styles.completionTitle}>AI Text Completion</Text>
              <Text style={styles.completionTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
            <View style={styles.completionBadge}>
              <MaterialIcons name="smart-toy" size={12} color={colors.surface} />
              <Text style={styles.badgeText}>AI</Text>
            </View>
          </View>
          
          <View style={styles.completionContent}>
            <View style={styles.textBlock}>
              <Text style={styles.textLabel}>Original:</Text>
              <Text style={styles.originalText}>{(item.data as OpenAICompletion).original_text}</Text>
            </View>
            
            <MaterialIcons name="arrow-downward" size={16} color={colors.textSecondary} style={styles.arrowIcon} />
            
            <View style={styles.textBlock}>
              <Text style={styles.textLabel}>Completed:</Text>
              <Text style={styles.completedText}>{(item.data as OpenAICompletion).completed_text}</Text>
            </View>
          </View>
        </View>
      )}
    </Animatable.View>
  );

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.detectionCount}</Text>
              <Text style={styles.statLabel}>Detections</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completionCount}</Text>
              <Text style={styles.statLabel}>AI Completions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.sessionCount}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive
            ]}>
              All ({combinedHistory.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'completions' && styles.filterTabActive]}
            onPress={() => setFilter('completions')}
          >
            <Text style={[
              styles.filterText,
              filter === 'completions' && styles.filterTextActive
            ]}>
              AI ({openaiCompletions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selection Header */}
        {combinedHistory.length > 0 && (
          <View style={styles.selectionHeader}>
            <Text style={styles.headerTitle}>
              {isSelectionMode 
                ? `${selectedItems.size} selected`
                : `${combinedHistory.length} items`
              }
            </Text>
            
            {isSelectionMode && (
              <View style={styles.selectionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={selectedItems.size === combinedHistory.length ? deselectAll : selectAll}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedItems.size === combinedHistory.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={deleteSelectedItems}
                >
                  <MaterialIcons name="delete" size={16} color={colors.error} />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (combinedHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="history"
          title="No History Yet"
          subtitle={
            filter === 'all' 
              ? "Start detecting signs or using AI completion to see your history here"
              : "No AI completions yet. Try the text completion feature!"
          }
          actionText="Start Detecting"
          onAction={() => {
            // Navigate to Live Detect tab
            // This would be handled by navigation in a real app
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={combinedHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Clear All FAB */}
      {!isSelectionMode && combinedHistory.length > 0 && (
        <FAB
          icon="delete-sweep"
          style={[styles.fab, { backgroundColor: colors.error }]}
          onPress={handleClearAll}
          color={colors.surface}
        />
      )}

      {/* Cancel Selection FAB */}
      {isSelectionMode && (
        <FAB
          icon="close"
          style={[styles.fab, { backgroundColor: colors.textSecondary }]}
          onPress={deselectAll}
          color={colors.surface}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    elevation: elevation.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  selectionHeader: {
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.overlay,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  deleteButtonText: {
    color: colors.error,
    marginLeft: spacing.xs,
  },
  completionItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: elevation.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  completionInfo: {
    flex: 1,
  },
  completionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  completionTime: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondary,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.surface,
    marginLeft: spacing.xs,
  },
  completionContent: {
    gap: spacing.md,
  },
  textBlock: {
    backgroundColor: colors.overlay,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  textLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  originalText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    fontStyle: 'italic',
  },
  completedText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  arrowIcon: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    elevation: elevation.lg,
  },
});

export default HistoryScreen;
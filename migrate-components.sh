#!/bin/bash

# Migration script for GIGAVIBE components from React+Vite to Next.js

SOURCE_DIR="/Users/udingethe/Dev/gigavibe/src"
TARGET_DIR="/Users/udingethe/Dev/gigavibe/gigavibe-nextjs/src"

echo "Starting component migration..."

# Create necessary directories
mkdir -p "$TARGET_DIR/components/ui"
mkdir -p "$TARGET_DIR/hooks"
mkdir -p "$TARGET_DIR/lib"

# Copy UI components
echo "Copying UI components..."
cp -r "$SOURCE_DIR/components/ui/"* "$TARGET_DIR/components/ui/"

# Copy hooks
echo "Copying hooks..."
cp -r "$SOURCE_DIR/hooks/"* "$TARGET_DIR/hooks/"

# Copy lib utilities
echo "Copying lib utilities..."
cp -r "$SOURCE_DIR/lib/"* "$TARGET_DIR/lib/"

# Copy core components (excluding already migrated ones)
echo "Copying core components..."
COMPONENTS_TO_COPY=(
    "AIModelSelector.tsx"
    "CoachMode.tsx"
    "AIPlayground.tsx"
    "AICoachingFeedback.tsx"
    "UsageTracker.tsx"
    "TargetNoteDisplay.tsx"
    "RecordingControls.tsx"
    "HorizontalPitchTrack.tsx"
    "WaveformVisualizer.tsx"
    "Footer.tsx"
    "SettingsScreen.tsx"
    "BottomNavigation.tsx"
    "AIComparisonSidebar.tsx"
    "ExerciseProgressRing.tsx"
    "PitchMascot.tsx"
    "Header.tsx"
    "VocalAnalysisDisplay.tsx"
    "ExerciseCountdown.tsx"
    "CircularPitchWheel.tsx"
    "AnalysisMode.tsx"
    "SingMode.tsx"
    "PracticeScreen.tsx"
    "ProgressScreen.tsx"
    "EnhancedTargetNoteDisplay.tsx"
    "AICoachingSettings.tsx"
)

for component in "${COMPONENTS_TO_COPY[@]}"; do
    if [ -f "$SOURCE_DIR/components/$component" ]; then
        echo "Copying $component..."
        cp "$SOURCE_DIR/components/$component" "$TARGET_DIR/components/"
    else
        echo "Warning: $component not found in source"
    fi
done

echo "Component migration completed!"
echo "Next steps:"
echo "1. Update import paths in copied components"
echo "2. Replace react-router-dom with Next.js navigation"
echo "3. Update any Vite-specific imports"
echo "4. Test each component individually"

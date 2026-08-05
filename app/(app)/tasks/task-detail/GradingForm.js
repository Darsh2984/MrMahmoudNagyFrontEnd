import React from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../../../src/components/ui/Button";
import { colors } from "../../../../src/theme";

import {
  formatFileSize,
} from "./taskDetail.helpers";

import { styles } from "./submissionCard.styles";

export function GradingForm({
  submission,
  gradeOutOf,
  form,
  isSaving,
  isEditing,
  onChangeGrade,
  onChangeComments,
  onSelectFiles,
  onRemoveSelectedFile,
  onSave,
  onCancelEditing,
}) {
  const selectedFiles =
    Array.isArray(
      form?.correctedFiles,
    )
      ? form.correctedFiles
      : [];

  return (
    <View style={styles.gradingPanel}>
      <View style={styles.gradingHeading}>
        <View style={styles.gradingHeadingIcon}>
          <Ionicons
            name={
              isEditing
                ? "create-outline"
                : "school-outline"
            }
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.gradingHeadingCopy}>
          <Text style={styles.gradingTitle}>
            {isEditing
              ? "Edit grade"
              : "Grade submission"}
          </Text>

          <Text style={styles.gradingSubtitle}>
            {isEditing
              ? "Update the grade or feedback. Newly selected corrected files will be added to the existing returned files."
              : "Enter the final grade, add feedback, and optionally return corrected files to the student."}
          </Text>
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Grade
        </Text>

        <View style={styles.gradeInputWrapper}>
          <TextInput
            value={form?.grade || ""}
            onChangeText={onChangeGrade}
            editable={!isSaving}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.gradeInput}
          />

          <View style={styles.gradeSuffix}>
            <Text style={styles.gradeSuffixText}>
              / {gradeOutOf ?? "-"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Feedback
        </Text>

        <TextInput
          value={form?.comments || ""}
          onChangeText={onChangeComments}
          editable={!isSaving}
          multiline
          textAlignVertical="top"
          placeholder="Add feedback for the student..."
          placeholderTextColor={colors.textMuted}
          style={styles.commentsInput}
        />
      </View>

      <View style={styles.formField}>
        <View style={styles.correctedPickerHeader}>
          <View style={styles.correctedPickerCopy}>
            <Text style={styles.formLabel}>
              Corrected files
            </Text>

            <Text style={styles.formHelper}>
              Optional. You can select multiple PDF, image,
              Word, Excel, PowerPoint, or text files.
            </Text>
          </View>

          <Button
            title="Select files"
            variant="outline"
            disabled={isSaving}
            onPress={onSelectFiles}
          />
        </View>

        {selectedFiles.length ? (
          <View style={styles.selectedFilesList}>
            {selectedFiles.map(
              (file, index) => {
                const fileKey =
                  file.localId ||
                  `${file.name}-${index}`;

                return (
                  <View
                    key={fileKey}
                    style={styles.selectedFileRow}
                  >
                    <View style={styles.selectedFileIcon}>
                      <Ionicons
                        name="document-attach-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.selectedFileCopy}>
                      <Text
                        numberOfLines={1}
                        style={styles.selectedFileName}
                      >
                        {file.name ||
                          file.fileName ||
                          `Corrected file ${index + 1}`}
                      </Text>

                      <Text style={styles.selectedFileMeta}>
                        {formatFileSize(file.size)}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityLabel="Remove selected file"
                      disabled={isSaving}
                      onPress={() =>
                        onRemoveSelectedFile(
                          file.localId,
                        )
                      }
                      style={({ pressed }) => [
                        styles.removeSelectedFile,
                        pressed &&
                          !isSaving &&
                          styles.pressed,
                        isSaving &&
                          styles.disabled,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={18}
                        color={colors.danger}
                      />
                    </Pressable>
                  </View>
                );
              },
            )}
          </View>
        ) : (
          <View style={styles.noSelectedFiles}>
            <Ionicons
              name="document-outline"
              size={19}
              color={colors.textMuted}
            />

            <Text style={styles.noSelectedFilesText}>
              No corrected files selected.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.gradingActions}>
        <Button
          title={
            isSaving
              ? "Saving..."
              : isEditing
                ? "Save grade changes"
                : "Save grade and return"
          }
          variant="secondary"
          disabled={isSaving}
          onPress={onSave}
        />

        {isEditing ? (
          <Button
            title="Cancel editing"
            variant="outline"
            disabled={isSaving}
            onPress={onCancelEditing}
          />
        ) : null}

        {isSaving ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
        ) : null}
      </View>
    </View>
  );
}

export default GradingForm;
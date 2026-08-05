import React from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../../../src/components/ui/Button";
import { colors } from "../../../../src/theme";

import {
  getDelegationActionConfig,
} from "./taskDetail.helpers";

import { styles } from "./modal.styles";

function formatDateTime(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

export function DelegationHistoryModal({
  submission,
  history,
  loading,
  error,
  onClose,
}) {
  return (
    <Modal
      visible={Boolean(submission)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.historyModalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="git-network-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.modalHeadingCopy}>
              <Text style={styles.modalTitle}>
                Delegation history
              </Text>

              <Text style={styles.mutedText}>
                {submission?.student?.name ||
                  "Student"}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close"
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalClose,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
                  styles.disabled,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.historyLoading}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.loadingText}>
                Loading delegation history...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.modalState}>
              <Ionicons
                name="alert-circle-outline"
                size={34}
                color={colors.danger}
              />

              <Text style={styles.modalErrorTitle}>
                Couldn't load history
              </Text>

              <Text style={styles.modalEmptyText}>
                {error}
              </Text>
            </View>
          ) : !history?.length ? (
            <View style={styles.modalState}>
              <Ionicons
                name="time-outline"
                size={34}
                color={colors.textMuted}
              />

              <Text style={styles.modalEmptyTitle}>
                No delegation history
              </Text>

              <Text style={styles.modalEmptyText}>
                Delegation activity will appear here.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.historyList}
              contentContainerStyle={
                styles.historyListContent
              }
              showsVerticalScrollIndicator={false}
            >
              {history.map((entry, index) => {
                const config =
                  getDelegationActionConfig(
                    entry.action,
                  );

                return (
                  <View
                    key={entry.id}
                    style={styles.historyItem}
                  >
                    <View style={styles.historyRail}>
                      <View
                        style={[
                          styles.historyDot,
                          entry.action ===
                            "COMPLETED" &&
                            styles.historyDotSuccess,
                          entry.action ===
                            "REMOVED" &&
                            styles.historyDotDanger,
                          entry.action ===
                            "REOPENED" &&
                            styles.historyDotWarning,
                        ]}
                      />

                      {index <
                      history.length - 1 ? (
                        <View
                          style={
                            styles.historyLine
                          }
                        />
                      ) : null}
                    </View>

                    <View style={styles.historyContent}>
                      <View
                        style={
                          styles.historyEntryHeader
                        }
                      >
                        <View
                          style={
                            styles.historyEntryAction
                          }
                        >
                          <Ionicons
                            name={config.icon}
                            size={18}
                            color={colors.primary}
                          />

                          <Text
                            style={
                              styles.historyAction
                            }
                          >
                            {config.label}
                          </Text>
                        </View>

                        <Text
                          style={styles.historyDate}
                        >
                          {formatDateTime(
                            entry.createdAt,
                          )}
                        </Text>
                      </View>

                      <Text style={styles.historyMeta}>
                        Changed by{" "}
                        {entry.changedBy?.name ||
                          "Unknown user"}
                      </Text>

                      {entry.fromAssistant ||
                      entry.toAssistant ? (
                        <View
                          style={
                            styles.assignmentChangeRow
                          }
                        >
                          <View
                            style={
                              styles.assignmentChangeBox
                            }
                          >
                            <Text
                              style={
                                styles.changeLabel
                              }
                            >
                              From
                            </Text>

                            <Text
                              style={
                                styles.changeValue
                              }
                            >
                              {entry.fromAssistant
                                ?.name ||
                                "Unassigned"}
                            </Text>
                          </View>

                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={colors.textMuted}
                          />

                          <View
                            style={
                              styles.assignmentChangeBox
                            }
                          >
                            <Text
                              style={
                                styles.changeLabel
                              }
                            >
                              To
                            </Text>

                            <Text
                              style={
                                styles.changeValue
                              }
                            >
                              {entry.toAssistant
                                ?.name ||
                                "Unassigned"}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {entry.reason ? (
                        <View style={styles.historyReason}>
                          <Text
                            style={
                              styles.historyReasonLabel
                            }
                          >
                            Reason
                          </Text>

                          <Text
                            style={
                              styles.historyReasonText
                            }
                          >
                            {entry.reason}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.modalActions}>
            <Button
              title="Close"
              variant="outline"
              disabled={loading}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DelegationHistoryModal;
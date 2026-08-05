<Modal
  visible={Boolean(
    gradingHistorySubmission,
  )}
  transparent
  animationType="fade"
  onRequestClose={
    closeGradingHistory
  }
>
  <View
    style={
      styles.modalBackdrop
    }
  >
    <Pressable
      style={
        StyleSheet.absoluteFill
      }
      onPress={
        closeGradingHistory
      }
    />

    <View
      style={
        styles.gradingHistoryModalCard
      }
    >
      <View
        style={
          styles.modalHeader
        }
      >
        <View
          style={
            styles.modalIcon
          }
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={
              colors.primary
            }
          />
        </View>

        <View
          style={
            styles.modalHeadingCopy
          }
        >
          <Text
            style={
              styles.modalTitle
            }
          >
            Grading history
          </Text>

          <Text
            style={
              styles.mutedText
            }
          >
            {gradingHistorySubmission
              ?.student?.name ||
              "Student"}
          </Text>
        </View>

        <Pressable
          disabled={
            gradingHistoryLoading
          }
          onPress={
            closeGradingHistory
          }
          style={
            styles.modalClose
          }
        >
          <Ionicons
            name="close"
            size={22}
            color={
              colors.textPrimary
            }
          />
        </Pressable>
      </View>

      {gradingHistoryLoading ? (
        <View
          style={
            styles.historyLoading
          }
        >
          <ActivityIndicator
            color={
              colors.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading grading history...
          </Text>
        </View>
      ) : gradingHistoryError ? (
        <View
          style={
            styles.modalState
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={
              colors.danger
            }
          />

          <Text
            style={
              styles.errorText
            }
          >
            {gradingHistoryError}
          </Text>
        </View>
      ) : !gradingHistory.length ? (
        <View
          style={
            styles.modalState
          }
        >
          <Ionicons
            name="time-outline"
            size={32}
            color={
              colors.textMuted
            }
          />

          <Text
            style={
              styles.modalEmptyTitle
            }
          >
            No grading history
          </Text>
        </View>
      ) : (
        <ScrollView
          style={
            styles.historyList
          }
          contentContainerStyle={
            styles.historyListContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {gradingHistory.map(
            (entry, index) => {
              const config =
                getGradingActionConfig(
                  entry.action,
                );

              return (
                <View
                  key={entry.id}
                  style={
                    styles.historyItem
                  }
                >
                  <View
                    style={
                      styles.historyRail
                    }
                  >
                    <View
                      style={[
                        styles.historyDot,
                        entry.action ===
                          "REOPENED" &&
                          styles.historyDotWarning,
                        entry.action ===
                          "GRADED" &&
                          styles.historyDotSuccess,
                      ]}
                    />

                    {index <
                    gradingHistory.length -
                      1 ? (
                      <View
                        style={
                          styles.historyLine
                        }
                      />
                    ) : null}
                  </View>

                  <View
                    style={
                      styles.historyContent
                    }
                  >
                    <View
                      style={
                        styles.gradingHistoryHeader
                      }
                    >
                      <View
                        style={
                          styles.gradingHistoryAction
                        }
                      >
                        <Ionicons
                          name={
                            config.icon
                          }
                          size={18}
                          color={
                            colors.primary
                          }
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
                        style={
                          styles.historyDate
                        }
                      >
                        {formatDate(
                          entry.createdAt,
                        )}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.historyMeta
                      }
                    >
                      Changed by{" "}
                      {entry.changedBy
                        ?.name ||
                        "Unknown user"}
                    </Text>

                    <View
                      style={
                        styles.gradeChangeRow
                      }
                    >
                      <View
                        style={
                          styles.gradeChangeBox
                        }
                      >
                        <Text
                          style={
                            styles.gradeChangeLabel
                          }
                        >
                          Previous
                        </Text>

                        <Text
                          style={
                            styles.gradeChangeValue
                          }
                        >
                          {formatGradeValue(
                            entry.previousGrade,
                            task?.gradeOutOf,
                          )}
                        </Text>
                      </View>

                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={
                          colors.textMuted
                        }
                      />

                      <View
                        style={
                          styles.gradeChangeBox
                        }
                      >
                        <Text
                          style={
                            styles.gradeChangeLabel
                          }
                        >
                          New
                        </Text>

                        <Text
                          style={
                            styles.gradeChangeValue
                          }
                        >
                          {formatGradeValue(
                            entry.newGrade,
                            task?.gradeOutOf,
                          )}
                        </Text>
                      </View>
                    </View>

                    {entry.previousComments ||
                    entry.newComments ? (
                      <View
                        style={
                          styles.commentChangeBox
                        }
                      >
                        <Text
                          style={
                            styles.gradeChangeLabel
                          }
                        >
                          Feedback change
                        </Text>

                        <Text
                          style={
                            styles.commentChangeText
                          }
                        >
                          {entry.previousComments ||
                            "No previous feedback"}
                        </Text>

                        <Ionicons
                          name="arrow-down"
                          size={15}
                          color={
                            colors.textMuted
                          }
                        />

                        <Text
                          style={
                            styles.commentChangeText
                          }
                        >
                          {entry.newComments ||
                            "No feedback"}
                        </Text>
                      </View>
                    ) : null}

                    {entry.reason ? (
                      <View
                        style={
                          styles.historyReason
                        }
                      >
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
            },
          )}
        </ScrollView>
      )}

      <View
        style={
          styles.modalActions
        }
      >
        <Button
          title="Close"
          variant="outline"
          onPress={
            closeGradingHistory
          }
        />
      </View>
    </View>
  </View>
</Modal>
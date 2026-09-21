import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import countriesData from "world-countries";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { useAuth } from "../../src/contexts/AuthContext";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import { colors } from "../../src/theme";
import { styles } from "./groups.styles";

const DEFAULT_COUNTRY = {
  countryCode: "EG",
  callingCode: "20",
};

const EMPTY_STUDENT_FORM = {
  accessCode: "",
  studentPhone: "",
  studentPhoneCountry: DEFAULT_COUNTRY,
  fatherName: "",
  fatherPhone: "",
  fatherPhoneCountry: DEFAULT_COUNTRY,
  motherName: "",
  motherPhone: "",
  motherPhoneCountry: DEFAULT_COUNTRY,
};

const COUNTRIES = countriesData
  .flatMap((country) => {
    const root = country.idd?.root || "";
    const suffixes = country.idd?.suffixes || [];

    if (!root) {
      return [];
    }

    const callingCode =
      suffixes.length === 1
        ? `${root}${suffixes[0]}`
        : root;

    const normalizedCallingCode = callingCode.replace(
      /\+/g,
      ""
    );

    if (!normalizedCallingCode) {
      return [];
    }

    return [
      {
        countryCode: country.cca2,
        name: country.name.common,
        flag: country.flag,
        callingCode: normalizedCallingCode,
      },
    ];
  })
  .filter(
    (country, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.countryCode === country.countryCode
      ) === index
  )
  .sort((first, second) =>
    first.name.localeCompare(second.name)
  );

export default function Groups() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const isCompact = width < 900;
  const isMobile = width < 640;

  const isRegularAssistant =
    user?.role === "ASSISTANT" &&
    !user?.isHeadAssistant;

  const canManageGroups =
    user?.role === "TEACHER" ||
    Boolean(user?.isHeadAssistant);

  const canAddStudents =
    canManageGroups || isRegularAssistant;

  const canCreateGroups =
    canManageGroups || isRegularAssistant;

  const canEditStudentDetails =
    user?.role === "TEACHER" ||
    user?.role === "ASSISTANT" ||
    Boolean(user?.isHeadAssistant);

  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] =
    useState(null);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const [unassigned, setUnassigned] = useState([]);
  const [allAssistants, setAllAssistants] =
    useState([]);

  const [groupSearch, setGroupSearch] = useState("");
  const [studentSearch, setStudentSearch] =
    useState("");
  const [unassignedSearch, setUnassignedSearch] =
    useState("");

  const [showAddPicker, setShowAddPicker] =
    useState(false);

  const [
    showAssistantPicker,
    setShowAssistantPicker,
  ] = useState(false);

  const [editingStudentId, setEditingStudentId] =
    useState(null);

  const [studentEditForm, setStudentEditForm] =
    useState(null);

  const [newGroupName, setNewGroupName] =
    useState("");

  const [newYearName, setNewYearName] =
    useState("");

  const [sessionLink, setSessionLink] =
    useState("");

  const [
    savingSessionLink,
    setSavingSessionLink,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [groupsLoading, setGroupsLoading] =
    useState(false);

  const [groupLoading, setGroupLoading] =
    useState(false);

  const [
    unassignedLoading,
    setUnassignedLoading,
  ] = useState(false);

  const [
    assistantsLoading,
    setAssistantsLoading,
  ] = useState(false);

  const [creatingYear, setCreatingYear] =
    useState(false);

  const [creatingGroup, setCreatingGroup] =
    useState(false);

  const [
    assigningAssistantId,
    setAssigningAssistantId,
  ] = useState(null);

  const [
    unassigningAssistantId,
    setUnassigningAssistantId,
  ] = useState(null);

  const [
    selectedUnassignedStudentIds,
    setSelectedUnassignedStudentIds,
  ] = useState([]);

  const [
    addingSelectedStudents,
    setAddingSelectedStudents,
  ] = useState(false);

  const [
    removingStudentId,
    setRemovingStudentId,
  ] = useState(null);

  const [savingStudentId, setSavingStudentId] =
    useState(null);

  const [loadingStudentId, setLoadingStudentId] =
    useState(null);

  const [error, setError] = useState("");

  const selectedYear = useMemo(
    () =>
      years.find(
        (year) => year.id === selectedYearId
      ) || null,
    [years, selectedYearId]
  );

  const safeMembers = useMemo(
    () =>
      Array.isArray(selectedGroup?.members)
        ? selectedGroup.members
        : [],
    [selectedGroup]
  );

  const safeAssistantAssignments = useMemo(
    () =>
      Array.isArray(
        selectedGroup?.assistantAssignments
      )
        ? selectedGroup.assistantAssignments
        : [],
    [selectedGroup]
  );

  const assignedAssistantIds = useMemo(
    () =>
      new Set(
        safeAssistantAssignments
          .map(
            (assignment) =>
              assignment?.assistant?.id
          )
          .filter(Boolean)
      ),
    [safeAssistantAssignments]
  );

  const availableAssistants = useMemo(
    () =>
      allAssistants.filter(
        (assistant) =>
          !assignedAssistantIds.has(
            assistant.id
          )
      ),
    [allAssistants, assignedAssistantIds]
  );

  const selectedUnassignedIdSet = useMemo(
    () =>
      new Set(
        selectedUnassignedStudentIds.map(String)
      ),
    [selectedUnassignedStudentIds]
  );

  const selectedUnassignedCount =
    selectedUnassignedStudentIds.length;

  const filteredGroups = useMemo(() => {
    const query = groupSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return groups;
    }

    return groups.filter((group) =>
      group.name
        ?.toLowerCase()
        .includes(query)
    );
  }, [groups, groupSearch]);

  const filteredMembers = useMemo(() => {
    const query = studentSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return safeMembers;
    }

    return safeMembers.filter(
      (membership) => {
        const student =
          membership.student || {};

        return (
          student.name
            ?.toLowerCase()
            .includes(query) ||
          student.email
            ?.toLowerCase()
            .includes(query) ||
          student.school?.name
            ?.toLowerCase()
            .includes(query)
        );
      }
    );
  }, [safeMembers, studentSearch]);

  const filteredUnassigned = useMemo(() => {
    const query = unassignedSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return unassigned;
    }

    return unassigned.filter((student) => {
      return (
        student.name
          ?.toLowerCase()
          .includes(query) ||
        student.email
          ?.toLowerCase()
          .includes(query) ||
        student.school?.name
          ?.toLowerCase()
          .includes(query) ||
        student.desiredYear?.name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [unassigned, unassignedSearch]);

  const totalStudents = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total +
          (group._count?.members || 0),
        0
      ),
    [groups]
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const closeStudentEditor =
    useCallback(() => {
      setEditingStudentId(null);
      setStudentEditForm(null);
    }, []);

  const resetGroupWorkspace =
    useCallback(() => {
      setSelectedGroup(null);
      setSessionLink("");
      setGroupSearch("");
      setStudentSearch("");
      setUnassignedSearch("");
      setSelectedUnassignedStudentIds([]);
      setShowAddPicker(false);
      setShowAssistantPicker(false);
      closeStudentEditor();
    }, [closeStudentEditor]);

  const loadYears = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get("/years/mine");

        const loadedYears =
          Array.isArray(response.data)
            ? response.data
            : [];

        setYears(loadedYears);

        setSelectedYearId((current) => {
          if (
            current &&
            loadedYears.some(
              (year) =>
                year.id === current
            )
          ) {
            return current;
          }

          return (
            loadedYears[0]?.id || null
          );
        });
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Couldn't load academic years."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadGroups = useCallback(
    async (yearId) => {
      setGroups([]);
      resetGroupWorkspace();

      if (!yearId) {
        return;
      }

      setGroupsLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/groups/year/${yearId}`
        );

        setGroups(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Couldn't load groups."
          )
        );
      } finally {
        setGroupsLoading(false);
      }
    },
    [resetGroupWorkspace]
  );

  const loadGroupDetail = useCallback(
    async (groupId) => {
      if (!groupId) {
        return;
      }

      setGroupLoading(true);
      setError("");
      setShowAddPicker(false);
      setShowAssistantPicker(false);
      setStudentSearch("");
      setUnassignedSearch("");
      setSelectedUnassignedStudentIds([]);
      closeStudentEditor();

      try {
        const response = await api.get(
          `/groups/${groupId}`
        );

        setSelectedGroup({
          ...response.data,

          members: Array.isArray(
            response.data?.members
          )
            ? response.data.members
            : [],

          assistantAssignments:
            Array.isArray(
              response.data
                ?.assistantAssignments
            )
              ? response.data
                  .assistantAssignments
              : [],
        });

        setSessionLink(
          response.data?.sessionLink || ""
        );
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Couldn't load group details."
          )
        );
      } finally {
        setGroupLoading(false);
      }
    },
    [closeStudentEditor]
  );

  const loadUnassigned =
    useCallback(async (groupId) => {
      setUnassignedLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/students/status/unassigned",
          {
            params: { groupId },
          }
        );

        setUnassigned(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Couldn't load unassigned students."
          )
        );
      } finally {
        setUnassignedLoading(false);
      }
    }, []);

  const loadAllAssistants =
    useCallback(async () => {
      setAssistantsLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/auth/assistants"
        );

        setAllAssistants(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Couldn't load assistants."
          )
        );
      } finally {
        setAssistantsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    loadGroups(selectedYearId);
  }, [selectedYearId, loadGroups]);

  async function handleCreateYear() {
    const name = newYearName.trim();

    if (!name || creatingYear) {
      return;
    }

    setCreatingYear(true);
    setError("");

    try {
      const response =
        await api.post("/years", {
          name,
        });

      setNewYearName("");

      await loadYears();

      if (response.data?.id) {
        setSelectedYearId(
          response.data.id
        );
      }
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't create the academic year."
        )
      );
    } finally {
      setCreatingYear(false);
    }
  }

  async function handleCreateGroup() {
    const name = newGroupName.trim();

    if (
      !canCreateGroups ||
      !name ||
      !selectedYearId ||
      creatingGroup
    ) {
      return;
    }

    setCreatingGroup(true);
    setError("");

    try {
      const response =
        await api.post("/groups", {
          name,
          yearId: selectedYearId,
        });

      setNewGroupName("");

      await loadGroups(
        selectedYearId
      );

      if (response.data?.group?.id) {
        await loadGroupDetail(
          response.data.group.id
        );
      }
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't create the group."
        )
      );
    } finally {
      setCreatingGroup(false);
    }
  }

  async function loadGroupsWithoutReset(
    yearId
  ) {
    if (!yearId) {
      return;
    }

    try {
      const response = await api.get(
        `/groups/year/${yearId}`
      );

      setGroups(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch {
      // Group detail is refreshed
      // independently.
    }
  }

  async function handleSaveSessionLink() {
    if (
      !selectedGroup?.id ||
      !canManageGroups ||
      savingSessionLink
    ) {
      return;
    }

    const trimmedLink =
      sessionLink.trim();

    setSavingSessionLink(true);
    setError("");

    try {
      const response =
        await api.patch(
          `/groups/${selectedGroup.id}/session-link`,
          {
            sessionLink:
              trimmedLink || null,
          }
        );

      const savedLink =
        response.data?.sessionLink ||
        null;

      setSelectedGroup(
        (current) =>
          current
            ? {
                ...current,
                sessionLink:
                  savedLink,
              }
            : current
      );

      setSessionLink(
        savedLink || ""
      );

      await loadGroupsWithoutReset(
        selectedYearId
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't update the session link."
        )
      );
    } finally {
      setSavingSessionLink(false);
    }
  }

  async function openAssistantPicker() {
    const nextValue =
      !showAssistantPicker;

    setShowAssistantPicker(
      nextValue
    );

    setShowAddPicker(false);

    if (nextValue) {
      await loadAllAssistants();
    }
  }

  async function handleAssignAssistant(
    assistantId
  ) {
    if (
      !selectedGroup?.id ||
      assigningAssistantId
    ) {
      return;
    }

    setAssigningAssistantId(
      assistantId
    );

    setError("");

    try {
      await api.post(
        "/assistant-assignments",
        {
          assistantId,
          groupId:
            selectedGroup.id,
        }
      );

      await loadGroupDetail(
        selectedGroup.id
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't assign the assistant."
        )
      );
    } finally {
      setAssigningAssistantId(null);
    }
  }

  async function handleUnassignAssistant(
    assistantId
  ) {
    if (
      !selectedGroup?.id ||
      unassigningAssistantId
    ) {
      return;
    }

    setUnassigningAssistantId(
      assistantId
    );

    setError("");

    try {
      await api.delete(
        `/assistant-assignments/${assistantId}/${selectedGroup.id}`
      );

      await loadGroupDetail(
        selectedGroup.id
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't unassign the assistant."
        )
      );
    } finally {
      setUnassigningAssistantId(
        null
      );
    }
  }

  async function openAddStudentPicker() {
    if (!selectedGroup?.id || !canAddStudents) {
      return;
    }

    setShowAddPicker(true);
    setShowAssistantPicker(false);
    setUnassignedSearch("");
    setSelectedUnassignedStudentIds([]);

    await loadUnassigned(selectedGroup.id);
  }

function toggleUnassignedStudent(studentId) {
  if (!studentId || addingSelectedStudents) {
    return;
  }

  setSelectedUnassignedStudentIds(
    (current) => {
      const normalizedId = String(studentId);

      if (
        current.map(String).includes(normalizedId)
      ) {
        return current.filter(
          (id) => String(id) !== normalizedId
        );
      }

      return [...current, studentId];
    }
  );

  clearError();
}

function selectAllFilteredUnassigned() {
  if (
    addingSelectedStudents ||
    filteredUnassigned.length === 0
  ) {
    return;
  }

  setSelectedUnassignedStudentIds(
    filteredUnassigned.map(
      (student) => student.id
    )
  );

  clearError();
}

function clearSelectedUnassigned() {
  if (addingSelectedStudents) {
    return;
  }

  setSelectedUnassignedStudentIds([]);
}

async function handleAddSelectedStudents() {
    if (
      !selectedGroup?.id ||
      addingSelectedStudents
    ) {
      return;
    }

    if (!selectedUnassignedStudentIds.length) {
      setError(
        "Select at least one student to add to the group."
      );
      return;
    }

    setAddingSelectedStudents(true);
    setError("");

    try {
      await api.post(
        `/groups/${selectedGroup.id}/students`,
        {
          studentIds:
            selectedUnassignedStudentIds,
        }
      );

      setSelectedUnassignedStudentIds([]);

      await Promise.all([
        loadGroupDetail(selectedGroup.id),
        loadGroupsWithoutReset(selectedYearId),
        loadUnassigned(selectedGroup.id),
      ]);
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't add the selected students."
        )
      );
    } finally {
      setAddingSelectedStudents(false);
    }
  }
  async function handleRemoveStudent(
    studentId
  ) {
    if (
      !selectedGroup?.id ||
      removingStudentId ||
      !canManageGroups
    ) {
      return;
    }

    setRemovingStudentId(studentId);
    setError("");

    try {
      await api.delete(
        `/groups/${selectedGroup.id}/students/${studentId}`
      );

      closeStudentEditor();

      await Promise.all([
        loadGroupDetail(
          selectedGroup.id
        ),

        loadGroupsWithoutReset(
          selectedYearId
        ),
      ]);
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't remove the student."
        )
      );
    } finally {
      setRemovingStudentId(null);
    }
  }

  async function openStudentEdit(
    studentId
  ) {
    if (
      editingStudentId === studentId
    ) {
      closeStudentEditor();
      return;
    }

    setLoadingStudentId(studentId);
    setError("");

    try {
      const response = await api.get(
        `/students/${studentId}`
      );

      setStudentEditForm(
        buildStudentEditForm(
          response.data
        )
      );

      setEditingStudentId(
        studentId
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't load the student's information."
        )
      );
    } finally {
      setLoadingStudentId(null);
    }
  }

  function updateStudentField(
    key,
    value
  ) {
    setStudentEditForm(
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          [key]: value,
        };
      }
    );

    clearError();
  }

  async function saveStudentEdit(
    studentId
  ) {
    if (
      !studentEditForm ||
      savingStudentId
    ) {
      return;
    }

    const validationError =
      validateStudentEditForm(
        studentEditForm
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingStudentId(studentId);
    setError("");

    try {
      await api.patch(
        `/students/${studentId}`,
        {
          studentPhone:
            normalizeOptionalPhone(
              studentEditForm
                .studentPhoneCountry,
              studentEditForm
                .studentPhone
            ),

          fatherName:
            studentEditForm.fatherName
              .trim() || null,

          fatherPhone:
            normalizeOptionalPhone(
              studentEditForm
                .fatherPhoneCountry,
              studentEditForm
                .fatherPhone
            ),

          motherName:
            studentEditForm.motherName
              .trim() || null,

          motherPhone:
            normalizeOptionalPhone(
              studentEditForm
                .motherPhoneCountry,
              studentEditForm
                .motherPhone
            ),
        }
      );

      closeStudentEditor();

      if (selectedGroup?.id) {
        await loadGroupDetail(
          selectedGroup.id
        );
      }
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Couldn't save the student's information."
        )
      );
    } finally {
      setSavingStudentId(null);
    }
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <View
          style={styles.loadingIcon}
        >
          <MaterialCommunityIcons
            name="account-group-outline"
            size={30}
            color={colors.primary}
          />
        </View>

        <ActivityIndicator
          color={colors.primary}
          size="large"
        />

        <Text
          style={styles.loadingTitle}
        >
          Loading academic structure
        </Text>

        <Text
          style={styles.loadingText}
        >
          Preparing years, groups, and
          student records.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View
        style={styles.pageHeader}
      >
        <View
          style={styles.pageHeaderMain}
        >
          <View
            style={styles.pageHeaderIcon}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={28}
              color={colors.white}
            />
          </View>

          <View
            style={styles.pageHeaderText}
          >
            <Text
              style={styles.eyebrow}
            >
              ACADEMIC STRUCTURE
            </Text>

            <Text
              style={styles.pageTitle}
            >
              {isRegularAssistant
                ? "My Assigned Groups"
                : "Years & Groups"}
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              {isRegularAssistant
                ? "View your assigned groups and manage the contact information of their students."
                : "Organize academic years, groups, assistants, student membership, session links, and parent contact information."}
            </Text>
          </View>
        </View>
      </View>

      <ErrorBanner
        message={error}
        onDismiss={clearError}
      />

      <View
        style={styles.summaryGrid}
      >
        <SummaryCard
          icon="calendar-text-outline"
          label="Academic years"
          value={years.length}
        />

        <SummaryCard
          icon="account-multiple-outline"
          label={
            selectedYear
              ? "Groups in year"
              : "Groups"
          }
          value={groups.length}
        />

        <SummaryCard
          icon="school-outline"
          label="Students in year"
          value={totalStudents}
        />

        <SummaryCard
          icon="account-tie-outline"
          label="Selected assistants"
          value={
            selectedGroup
              ? safeAssistantAssignments.length
              : "—"
          }
        />
      </View>

      {canManageGroups ? (
        <Card
          style={styles.creationCard}
        >
          <View
            style={
              styles.creationHeader
            }
          >
            <View
              style={
                styles.creationHeaderIcon
              }
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={22}
                color={colors.primary}
              />
            </View>

            <View
              style={
                styles.creationHeaderText
              }
            >
              <Text
                style={
                  styles.creationTitle
                }
              >
                Create an academic year
              </Text>

              <Text
                style={
                  styles.creationDescription
                }
              >
                Add a year first, then
                create its groups and
                assign students.
              </Text>
            </View>
          </View>

          <View
            style={styles.inlineForm}
          >
            <TextInput
              value={newYearName}
              onChangeText={
                setNewYearName
              }
              onSubmitEditing={
                handleCreateYear
              }
              editable={!creatingYear}
              placeholder="Example: Year 1 - IGCSE"
              placeholderTextColor={
                colors.textMuted
              }
              returnKeyType="done"
              style={
                styles.inlineInput
              }
            />

            <Button
              title={
                creatingYear
                  ? "Creating..."
                  : "Create year"
              }
              variant="outline"
              onPress={
                handleCreateYear
              }
              loading={creatingYear}
              disabled={
                creatingYear ||
                !newYearName.trim()
              }
              style={
                styles.createYearButton
              }
            />
          </View>
        </Card>
      ) : (
        <Card
          style={
            styles.assistantNoticeCard
          }
        >
          <View
            style={
              styles.assistantNoticeIcon
            }
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={23}
              color={colors.primary}
            />
          </View>

          <View
            style={
              styles.assistantNoticeContent
            }
          >
            <Text
              style={
                styles.assistantNoticeTitle
              }
            >
              Assigned groups only
            </Text>

            <Text
              style={
                styles.assistantNoticeText
              }
            >
              Only groups assigned to your
              assistant account are shown.
              You can create groups in existing
              academic years and are automatically
              assigned to groups you create.
              You can also add unassigned students
              to these groups and update their
              contact information. Year
              structure, assistant assignments,
              session links, removals, and other
              group settings remain managed by
              the Teacher or a Head Assistant.
            </Text>
          </View>
        </Card>
      )}

      {years.length === 0 ? (
        <EmptyState
          icon="calendar-blank-outline"
          title={
            canManageGroups
              ? "No academic years yet"
              : "No assigned academic years"
          }
          description={
            canManageGroups
              ? "Create the first academic year above to start organizing groups and students."
              : "There are currently no groups assigned to your assistant account."
          }
        />
      ) : (
        <>
          <SectionHeader
            icon="calendar-month-outline"
            title="Academic years"
            description="Choose a year to view and manage its groups."
          />

          {isMobile && selectedYear ? (
            <View
              style={
                styles.selectedYearBanner
              }
            >
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color={colors.primary}
              />

              <View
                style={
                  styles.selectedYearBannerText
                }
              >
                <Text
                  style={
                    styles.selectedYearLabel
                  }
                >
                  Selected academic year
                </Text>

                <Text
                  style={
                    styles.selectedYearName
                  }
                >
                  {selectedYear.name}
                </Text>
              </View>
            </View>
          ) : null}

          {isMobile ? (
            <View
              style={[
                styles.yearChipRow,
                styles.yearChipRowWrapped,
              ]}
            >
              {years.map((year) => (
                <SelectionChip
                  key={year.id}
                  label={year.name}
                  selected={
                    year.id ===
                    selectedYearId
                  }
                  disabled={
                    groupsLoading
                  }
                  onPress={() =>
                    setSelectedYearId(
                      year.id
                    )
                  }
                />
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.yearChipRow
              }
            >
              {years.map((year) => (
                <SelectionChip
                  key={year.id}
                  label={year.name}
                  selected={
                    year.id ===
                    selectedYearId
                  }
                  disabled={
                    groupsLoading
                  }
                  onPress={() =>
                    setSelectedYearId(
                      year.id
                    )
                  }
                />
              ))}
            </ScrollView>
          )}

          <View
            style={[
              styles.workspace,

              isCompact &&
                styles.workspaceCompact,
            ]}
          >
            <View
              style={[
                styles.groupsColumn,

                isCompact &&
                  styles.fullWidthColumn,
              ]}
            >
              <Card
                style={styles.columnCard}
              >
                <View
                  style={
                    styles.columnHeader
                  }
                >
                  <SectionHeader
                    icon="account-multiple-outline"
                    title="Groups"
                    description={
                      selectedYear
                        ? `Groups inside ${selectedYear.name}`
                        : "Select an academic year."
                    }
                    compact
                  />

                  <CountBadge
                    value={groups.length}
                    label="groups"
                  />
                </View>

                {canCreateGroups ? (
                  <View
                    style={
                      styles.inlineForm
                    }
                  >
                    <TextInput
                      value={newGroupName}
                      onChangeText={
                        setNewGroupName
                      }
                      onSubmitEditing={
                        handleCreateGroup
                      }
                      editable={
                        Boolean(
                          selectedYearId
                        ) &&
                        !creatingGroup
                      }
                      placeholder="New group name"
                      placeholderTextColor={
                        colors.textMuted
                      }
                      returnKeyType="done"
                      style={
                        styles.inlineInput
                      }
                    />

                    <Button
                      title={
                        creatingGroup
                          ? "Adding..."
                          : "Add group"
                      }
                      variant="warning"
                      onPress={
                        handleCreateGroup
                      }
                      loading={
                        creatingGroup
                      }
                      disabled={
                        creatingGroup ||
                        !selectedYearId ||
                        !newGroupName.trim()
                      }
                      style={
                        styles.addGroupButton
                      }
                    />
                  </View>
                ) : null}

                {groups.length > 4 ? (
                  <SearchInput
                    value={groupSearch}
                    onChangeText={
                      setGroupSearch
                    }
                    placeholder="Search groups"
                    style={
                      styles.groupSearch
                    }
                  />
                ) : null}

                {groupsLoading ? (
                  <LoadingPanel message="Loading groups..." />
                ) : groups.length === 0 ? (
                  <EmptyState
                    icon="account-group-outline"
                    title="No groups in this year"
                    description={
                      canManageGroups
                        ? "Create the first group using the form above."
                        : "No groups from this year are currently assigned to you."
                    }
                    compact
                  />
                ) : filteredGroups.length ===
                  0 ? (
                  <EmptyState
                    icon="magnify"
                    title="No matching groups"
                    description="Try a different group name."
                    compact
                  />
                ) : (
                  <View
                    style={
                      styles.groupList
                    }
                  >
                    {filteredGroups.map(
                      (group) => {
                        const active =
                          selectedGroup?.id ===
                          group.id;

                        return (
                          <Pressable
                            key={group.id}
                            accessibilityRole="button"
                            accessibilityState={{
                              selected:
                                active,
                            }}
                            onPress={() =>
                              loadGroupDetail(
                                group.id
                              )
                            }
                            style={({
                              pressed,
                            }) => [
                              styles.groupItem,

                              active &&
                                styles.groupItemActive,

                              pressed &&
                                styles.pressedOpacity,
                            ]}
                          >
                            <View
                              style={[
                                styles.groupItemIcon,

                                active &&
                                  styles.groupItemIconActive,
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="account-group-outline"
                                size={21}
                                color={
                                  active
                                    ? colors.white
                                    : colors.primary
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.groupItemText
                              }
                            >
                              <Text
                                numberOfLines={
                                  1
                                }
                                style={[
                                  styles.groupName,

                                  active &&
                                    styles.groupNameActive,
                                ]}
                              >
                                {
                                  group.name
                                }
                              </Text>

                              <Text
                                style={[
                                  styles.groupCount,

                                  active &&
                                    styles.groupCountActive,
                                ]}
                              >
                                {group._count
                                  ?.members ||
                                  0}{" "}
                                students
                              </Text>
                            </View>

                            <MaterialCommunityIcons
                              name="chevron-right"
                              size={24}
                              color={
                                active
                                  ? colors.white
                                  : colors.textMuted
                              }
                            />
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                )}
              </Card>
            </View>

            <View
              style={[
                styles.rosterColumn,

                isCompact &&
                  styles.fullWidthColumn,
              ]}
            >
              {groupLoading ? (
                <Card
                  style={
                    styles.rosterCard
                  }
                >
                  <LoadingPanel message="Loading group details..." />
                </Card>
              ) : !selectedGroup ? (
                <Card
                  style={
                    styles.rosterCard
                  }
                >
                  <EmptyState
                    icon="cursor-default-click-outline"
                    title="Select a group"
                    description="Choose a group to view its students, session link, and assigned assistants."
                  />
                </Card>
              ) : (
                <Card
                  style={
                    styles.rosterCard
                  }
                >
                  <View
                    style={
                      styles.rosterHeader
                    }
                  >
                    <View
                      style={
                        styles.rosterIdentity
                      }
                    >
                      <View
                        style={
                          styles.rosterHeaderIcon
                        }
                      >
                        <MaterialCommunityIcons
                          name="account-group"
                          size={27}
                          color={
                            colors.white
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.rosterHeaderText
                        }
                      >
                        <Text
                          style={
                            styles.rosterTitle
                          }
                        >
                          {
                            selectedGroup.name
                          }
                        </Text>

                        <View
                          style={
                            styles.rosterMetaRow
                          }
                        >
                          <MetaPill
                            icon="school-outline"
                            label={`${safeMembers.length} students`}
                          />

                          <MetaPill
                            icon="account-tie-outline"
                            label={`${safeAssistantAssignments.length} assistants`}
                          />
                        </View>
                      </View>
                    </View>

                    {canAddStudents ? (
                      <Button
                        title="Add students"
                        variant="secondary"
                        onPress={openAddStudentPicker}
                        disabled={
                          unassignedLoading ||
                          addingSelectedStudents
                        }
                      />
                    ) : null}
                  </View>

                  <View
                    style={styles.divider}
                  />

                  {canManageGroups ? (
                    <>
                      <View
                        style={
                          styles.sessionLinkSection
                        }
                      >
                        <View
                          style={
                            styles.sessionLinkHeader
                          }
                        >
                          <View
                            style={
                              styles.sessionLinkTitleRow
                            }
                          >
                            <View
                              style={
                                styles.sessionLinkIcon
                              }
                            >
                              <MaterialCommunityIcons
                                name="video-outline"
                                size={22}
                                color={
                                  colors.primary
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.sessionLinkHeaderText
                              }
                            >
                              <Text
                                style={
                                  styles.subsectionTitle
                                }
                              >
                                Online
                                session link
                              </Text>

                              <Text
                                style={
                                  styles.subsectionDescription
                                }
                              >
                                Set the
                                permanent
                                Zoom,
                                Google Meet,
                                Teams, or
                                other online
                                session link
                                for this
                                group.
                                Students in
                                this group
                                will use it
                                when they
                                press Join
                                the Session.
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.sessionLinkForm,

                            isCompact &&
                              styles.sessionLinkFormCompact,
                          ]}
                        >
                          <TextInput
                            value={
                              sessionLink
                            }
                            onChangeText={
                              setSessionLink
                            }
                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                            placeholderTextColor={
                              colors.textMuted
                            }
                            autoCapitalize="none"
                            autoCorrect={
                              false
                            }
                            keyboardType="url"
                            editable={
                              !savingSessionLink
                            }
                            style={
                              styles.sessionLinkInput
                            }
                          />

                          <Button
                            title={
                              savingSessionLink
                                ? "Saving..."
                                : "Save link"
                            }
                            onPress={
                              handleSaveSessionLink
                            }
                            loading={
                              savingSessionLink
                            }
                            disabled={
                              savingSessionLink
                            }
                            style={
                              styles.sessionLinkSaveButton
                            }
                          />
                        </View>

                        {selectedGroup.sessionLink ? (
                          <View
                            style={
                              styles.currentSessionLink
                            }
                          >
                            <MaterialCommunityIcons
                              name="check-circle-outline"
                              size={19}
                              color={
                                colors.secondary
                              }
                            />

                            <View
                              style={
                                styles.currentSessionLinkContent
                              }
                            >
                              <Text
                                style={
                                  styles.currentSessionLinkLabel
                                }
                              >
                                Current
                                session
                                link
                              </Text>

                              <Text
                                selectable
                                numberOfLines={
                                  2
                                }
                                style={
                                  styles.currentSessionLinkText
                                }
                              >
                                {
                                  selectedGroup.sessionLink
                                }
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <View
                            style={
                              styles.noSessionLink
                            }
                          >
                            <MaterialCommunityIcons
                              name="information-outline"
                              size={19}
                              color={
                                colors.textMuted
                              }
                            />

                            <Text
                              style={
                                styles.noSessionLinkText
                              }
                            >
                              No online
                              session link
                              has been
                              added for
                              this group
                              yet.
                            </Text>
                          </View>
                        )}

                        {selectedGroup.sessionLink &&
                        sessionLink.trim() ===
                          "" ? (
                          <Text
                            style={
                              styles.sessionLinkClearHelp
                            }
                          >
                            Save the empty
                            field to remove
                            the current
                            session link.
                          </Text>
                        ) : null}
                      </View>

                      <View
                        style={
                          styles.divider
                        }
                      />
                    </>
                  ) : null}

                  <View
                    style={
                      styles.assistantSection
                    }
                  >
                    <View
                      style={
                        styles.subsectionHeader
                      }
                    >
                      <View
                        style={
                          styles.subsectionHeaderText
                        }
                      >
                        <Text
                          style={
                            styles.subsectionTitle
                          }
                        >
                          Assigned assistants
                        </Text>

                        <Text
                          style={
                            styles.subsectionDescription
                          }
                        >
                          Assistants receive
                          delegated grading
                          work and group
                          tickets.
                        </Text>
                      </View>

                      {canManageGroups ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={
                            openAssistantPicker
                          }
                          disabled={
                            assistantsLoading
                          }
                          style={({
                            pressed,
                          }) => [
                            styles.textAction,

                            pressed &&
                              styles.pressedOpacity,
                          ]}
                        >
                          {assistantsLoading ? (
                            <ActivityIndicator
                              size="small"
                              color={
                                colors.primary
                              }
                            />
                          ) : (
                            <>
                              <MaterialCommunityIcons
                                name={
                                  showAssistantPicker
                                    ? "close"
                                    : "account-plus-outline"
                                }
                                size={17}
                                color={
                                  colors.primary
                                }
                              />

                              <Text
                                style={
                                  styles.textActionLabel
                                }
                              >
                                {showAssistantPicker
                                  ? "Close"
                                  : "Assign assistant"}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      ) : null}
                    </View>

                    {safeAssistantAssignments.length ===
                    0 ? (
                      <InlineEmpty
                        icon="account-off-outline"
                        text="No assistants are currently assigned."
                      />
                    ) : (
                      <View
                        style={
                          styles.assistantChipRow
                        }
                      >
                        {safeAssistantAssignments.map(
                          (
                            assignment
                          ) => {
                            const assistant =
                              assignment.assistant;

                            if (
                              !assistant
                            ) {
                              return null;
                            }

                            const removing =
                              unassigningAssistantId ===
                              assistant.id;

                            return (
                              <View
                                key={
                                  assistant.id
                                }
                                style={
                                  styles.assistantChip
                                }
                              >
                                <View
                                  style={
                                    styles.assistantChipAvatar
                                  }
                                >
                                  <Text
                                    style={
                                      styles.assistantChipAvatarText
                                    }
                                  >
                                    {getInitials(
                                      assistant.name
                                    )}
                                  </Text>
                                </View>

                                <View
                                  style={
                                    styles.assistantChipInfo
                                  }
                                >
                                  <Text
                                    numberOfLines={
                                      1
                                    }
                                    style={
                                      styles.assistantChipText
                                    }
                                  >
                                    {
                                      assistant.name
                                    }
                                  </Text>

                                  {assistant.isHeadAssistant ? (
                                    <Text
                                      style={
                                        styles.assistantRoleText
                                      }
                                    >
                                      Head
                                      Assistant
                                    </Text>
                                  ) : null}
                                </View>

                                {canManageGroups ? (
                                  <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Unassign ${assistant.name}`}
                                    disabled={
                                      removing
                                    }
                                    onPress={() =>
                                      handleUnassignAssistant(
                                        assistant.id
                                      )
                                    }
                                    style={({
                                      pressed,
                                    }) => [
                                      styles.removeChipButton,

                                      pressed &&
                                        styles.pressedOpacity,
                                    ]}
                                  >
                                    {removing ? (
                                      <ActivityIndicator
                                        size="small"
                                        color={
                                          colors.danger
                                        }
                                      />
                                    ) : (
                                      <MaterialCommunityIcons
                                        name="close"
                                        size={17}
                                        color={
                                          colors.danger
                                        }
                                      />
                                    )}
                                  </Pressable>
                                ) : null}
                              </View>
                            );
                          }
                        )}
                      </View>
                    )}

                    {showAssistantPicker ? (
                      <View
                        style={
                          styles.pickerPanel
                        }
                      >
                        <View
                          style={
                            styles.pickerPanelHeader
                          }
                        >
                          <View
                            style={
                              styles.pickerPanelIcon
                            }
                          >
                            <MaterialCommunityIcons
                              name="account-plus-outline"
                              size={20}
                              color={
                                colors.primary
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.flexOne
                            }
                          >
                            <Text
                              style={
                                styles.pickerPanelTitle
                              }
                            >
                              Available
                              assistants
                            </Text>

                            <Text
                              style={
                                styles.subsectionDescription
                              }
                            >
                              Select an
                              assistant to
                              assign them
                              to this
                              group.
                            </Text>
                          </View>
                        </View>

                        {assistantsLoading ? (
                          <LoadingPanel message="Loading assistants..." />
                        ) : availableAssistants.length ===
                          0 ? (
                          <InlineEmpty
                            icon="check-circle-outline"
                            text="All available assistants are already assigned."
                          />
                        ) : (
                          <View
                            style={
                              styles.pickerAssistantList
                            }
                          >
                            {availableAssistants.map(
                              (
                                assistant
                              ) => {
                                const assigning =
                                  assigningAssistantId ===
                                  assistant.id;

                                return (
                                  <Pressable
                                    key={
                                      assistant.id
                                    }
                                    disabled={Boolean(
                                      assigningAssistantId
                                    )}
                                    onPress={() =>
                                      handleAssignAssistant(
                                        assistant.id
                                      )
                                    }
                                    style={({
                                      pressed,
                                    }) => [
                                      styles.pickerAssistantRow,

                                      pressed &&
                                        styles.pressedOpacity,

                                      assigning &&
                                        styles.disabledOpacity,
                                    ]}
                                  >
                                    <View
                                      style={
                                        styles.smallAvatar
                                      }
                                    >
                                      <Text
                                        style={
                                          styles.smallAvatarText
                                        }
                                      >
                                        {getInitials(
                                          assistant.name
                                        )}
                                      </Text>
                                    </View>

                                    <View
                                      style={
                                        styles.flexOne
                                      }
                                    >
                                      <Text
                                        style={
                                          styles.pickerAssistantName
                                        }
                                      >
                                        {
                                          assistant.name
                                        }
                                      </Text>

                                      <Text
                                        style={
                                          styles.pickerAssistantMeta
                                        }
                                      >
                                        {assistant.isHeadAssistant
                                          ? "Head Assistant"
                                          : "Assistant"}
                                      </Text>
                                    </View>

                                    {assigning ? (
                                      <ActivityIndicator
                                        size="small"
                                        color={
                                          colors.primary
                                        }
                                      />
                                    ) : (
                                      <View
                                        style={
                                          styles.addCircle
                                        }
                                      >
                                        <MaterialCommunityIcons
                                          name="plus"
                                          size={17}
                                          color={
                                            colors.primary
                                          }
                                        />
                                      </View>
                                    )}
                                  </Pressable>
                                );
                              }
                            )}
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>

                  {showAddPicker ? (
                    <View style={styles.pickerPanel}>
                      <View style={styles.subsectionHeader}>
                        <View style={styles.subsectionHeaderText}>
                          <Text style={styles.pickerPanelTitle}>
                            Unassigned students
                          </Text>

                          <Text style={styles.subsectionDescription}>
                            Select one or more students to add to{" "}
                            {selectedGroup.name}. The school and
                            requested academic year are shown to help
                            you choose the correct dedicated group.
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => {
                            setShowAddPicker(false);
                            setSelectedUnassignedStudentIds([]);
                          }}
                          disabled={addingSelectedStudents}
                          style={({ pressed }) => [
                            styles.iconActionButton,
                            pressed &&
                              !addingSelectedStudents &&
                              styles.pressedOpacity,
                            addingSelectedStudents &&
                              styles.disabledOpacity,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={colors.textPrimary}
                          />
                        </Pressable>
                      </View>

                      {!unassignedLoading &&
                      unassigned.length > 4 ? (
                        <SearchInput
                          value={unassignedSearch}
                          onChangeText={setUnassignedSearch}
                          placeholder="Search by name, email, school, or academic year"
                        />
                      ) : null}

                      {!unassignedLoading &&
                      filteredUnassigned.length > 0 ? (
                        <View style={styles.unassignedBulkBar}>
                          <View style={styles.bulkSelectionInfo}>
                            <Text style={styles.bulkSelectionTitle}>
                              {selectedUnassignedCount} selected
                            </Text>

                            <Text style={styles.bulkSelectionText}>
                              Add selected students to{" "}
                              {selectedGroup.name}.
                            </Text>
                          </View>

                          <View style={styles.bulkActionRow}>
                            <Pressable
                              onPress={selectAllFilteredUnassigned}
                              disabled={addingSelectedStudents}
                              style={({ pressed }) => [
                                styles.bulkTextButton,
                                pressed &&
                                  !addingSelectedStudents &&
                                  styles.pressedOpacity,
                                addingSelectedStudents &&
                                  styles.disabledOpacity,
                              ]}
                            >
                              <Text style={styles.bulkTextButtonLabel}>
                                Select all visible
                              </Text>
                            </Pressable>

                            {selectedUnassignedCount > 0 ? (
                              <Pressable
                                onPress={clearSelectedUnassigned}
                                disabled={addingSelectedStudents}
                                style={({ pressed }) => [
                                  styles.bulkTextButton,
                                  pressed &&
                                    !addingSelectedStudents &&
                                    styles.pressedOpacity,
                                  addingSelectedStudents &&
                                    styles.disabledOpacity,
                                ]}
                              >
                                <Text style={styles.bulkTextButtonLabel}>
                                  Clear
                                </Text>
                              </Pressable>
                            ) : null}

                            <Button
                              title={
                                addingSelectedStudents
                                  ? "Adding..."
                                  : `Add selected (${selectedUnassignedCount})`
                              }
                              variant="secondary"
                              onPress={handleAddSelectedStudents}
                              loading={addingSelectedStudents}
                              disabled={
                                addingSelectedStudents ||
                                selectedUnassignedCount === 0
                              }
                            />
                          </View>
                        </View>
                      ) : null}

                      {unassignedLoading ? (
                        <LoadingPanel message="Loading students..." />
                      ) : unassigned.length === 0 ? (
                        <InlineEmpty
                          icon="account-check-outline"
                          text="There are no unassigned students."
                        />
                      ) : filteredUnassigned.length === 0 ? (
                        <InlineEmpty
                          icon="magnify"
                          text="No students match your search."
                        />
                      ) : (
                        <View style={styles.unassignedList}>
                          {filteredUnassigned.map((student) => {
                            const selected =
                              selectedUnassignedIdSet.has(
                                String(student.id)
                              );

                            return (
                              <Pressable
                                key={student.id}
                                disabled={addingSelectedStudents}
                                onPress={() =>
                                  toggleUnassignedStudent(
                                    student.id
                                  )
                                }
                                style={({ pressed }) => [
                                  styles.unassignedRow,
                                  selected &&
                                    styles.unassignedRowSelected,
                                  pressed &&
                                    !addingSelectedStudents &&
                                    styles.pressedOpacity,
                                  addingSelectedStudents &&
                                    styles.disabledOpacity,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.studentCheckbox,
                                    selected &&
                                      styles.studentCheckboxSelected,
                                  ]}
                                >
                                  {selected ? (
                                    <MaterialCommunityIcons
                                      name="check"
                                      size={15}
                                      color={colors.white}
                                    />
                                  ) : null}
                                </View>

                                <Avatar name={student.name} />

                                <View style={styles.unassignedInfo}>
                                  <Text
                                    numberOfLines={1}
                                    style={styles.unassignedName}
                                  >
                                    {student.name}
                                  </Text>

                                  <View style={styles.unassignedMetaRow}>
                                    <MaterialCommunityIcons
                                      name="office-building-outline"
                                      size={14}
                                      color={colors.textMuted}
                                    />

                                    <Text
                                      numberOfLines={1}
                                      style={styles.unassignedMetaText}
                                    >
                                      {student.school?.name ||
                                        "No school selected"}
                                    </Text>
                                  </View>

                                  <View style={styles.unassignedMetaRow}>
                                    <MaterialCommunityIcons
                                      name="calendar-text-outline"
                                      size={14}
                                      color={
                                        student.desiredYear?.name
                                          ? colors.primary
                                          : colors.textMuted
                                      }
                                    />

                                    <Text
                                      numberOfLines={
                                        isMobile ? 2 : 1
                                      }
                                      style={[
                                        styles.unassignedMetaText,
                                        student.desiredYear?.name &&
                                          styles.unassignedDesiredYearText,
                                      ]}
                                    >
                                      Wanted academic year:{" "}
                                      {student.desiredYear?.name ||
                                        "Not selected"}
                                    </Text>
                                  </View>
                                </View>

                                <View
                                  style={[
                                    styles.addStudentAction,
                                    selected &&
                                      styles.addStudentActionSelected,
                                  ]}
                                >
                                  <MaterialCommunityIcons
                                    name={
                                      selected
                                        ? "check-circle-outline"
                                        : "plus"
                                    }
                                    size={16}
                                    color={
                                      selected
                                        ? colors.white
                                        : colors.primary
                                    }
                                  />

                                  <Text
                                    style={[
                                      styles.addStudentLabel,
                                      selected &&
                                        styles.addStudentLabelSelected,
                                    ]}
                                  >
                                    {selected ? "Selected" : "Select"}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ) : null}

                  <View
                    style={styles.divider}
                  />

                  <View
                    style={
                      styles.studentsHeader
                    }
                  >
                    <SectionHeader
                      icon="school-outline"
                      title={`Students (${safeMembers.length})`}
                      description={
                        canManageGroups
                          ? "View contact details, edit student information, or remove students from the group."
                          : "Add unassigned students and update contact information for this assigned group."
                      }
                      compact
                    />

                    {safeMembers.length >
                    4 ? (
                      <SearchInput
                        value={
                          studentSearch
                        }
                        onChangeText={
                          setStudentSearch
                        }
                        placeholder="Search students"
                        style={
                          styles.studentSearch
                        }
                      />
                    ) : null}
                  </View>

                  {safeMembers.length ===
                  0 ? (
                    <EmptyState
                      icon="account-school-outline"
                      title="No students in this group"
                      description={
                        canAddStudents
                          ? "Use Add student to assign an unassigned student."
                          : "This group currently has no students."
                      }
                      compact
                    />
                  ) : filteredMembers.length ===
                    0 ? (
                    <EmptyState
                      icon="magnify"
                      title="No matching students"
                      description="Try a different name, email, or school."
                      compact
                    />
                  ) : (
                    <View
                      style={
                        styles.rosterList
                      }
                    >
                      {filteredMembers.map(
                        (
                          membership
                        ) => {
                          const student =
                            membership.student;

                          if (
                            !student
                          ) {
                            return null;
                          }

                          const isEditing =
                            editingStudentId ===
                            student.id;

                          const isLoadingEdit =
                            loadingStudentId ===
                            student.id;

                          const isRemoving =
                            removingStudentId ===
                            student.id;

                          return (
                            <View
                              key={
                                membership.id ||
                                student.id
                              }
                              style={[
                                styles.studentBlock,

                                isEditing &&
                                  styles.studentBlockEditing,
                              ]}
                            >
                              <View
                                style={
                                  styles.studentRow
                                }
                              >
                                <Avatar
                                  name={
                                    student.name
                                  }
                                  large
                                />

                                <View
                                  style={
                                    styles.studentInfo
                                  }
                                >
                                  <Text
                                    numberOfLines={
                                      1
                                    }
                                    style={
                                      styles.studentName
                                    }
                                  >
                                    {
                                      student.name
                                    }
                                  </Text>

                                  <View
                                    style={
                                      styles.studentMetaRow
                                    }
                                  >
                                    <MaterialCommunityIcons
                                      name="email-outline"
                                      size={14}
                                      color={
                                        colors.textMuted
                                      }
                                    />

                                    <Text
                                      numberOfLines={
                                        1
                                      }
                                      style={
                                        styles.studentMeta
                                      }
                                    >
                                      {student.email ||
                                        "No email shown"}
                                    </Text>
                                  </View>

                                  {student
                                    .school
                                    ?.name ? (
                                    <View
                                      style={
                                        styles.studentMetaRow
                                      }
                                    >
                                      <MaterialCommunityIcons
                                        name="office-building-outline"
                                        size={14}
                                        color={
                                          colors.textMuted
                                        }
                                      />

                                      <Text
                                        numberOfLines={
                                          1
                                        }
                                        style={
                                          styles.studentMeta
                                        }
                                      >
                                        {
                                          student
                                            .school
                                            .name
                                        }
                                      </Text>
                                    </View>
                                  ) : null}
                                  {student.desiredYear?.name ? (
                                    <View style={styles.studentMetaRow}>
                                      <MaterialCommunityIcons
                                        name="calendar-text-outline"
                                        size={14}
                                        color={colors.textMuted}
                                      />

                                      <Text
                                        numberOfLines={1}
                                        style={styles.studentMeta}
                                      >
                                        Wanted year:{" "}
                                        {student.desiredYear.name}
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>

                                <View
                                  style={
                                    styles.studentActions
                                  }
                                >
                                  {canEditStudentDetails ? (
                                    <Pressable
                                      disabled={
                                        isLoadingEdit
                                      }
                                      onPress={() =>
                                        openStudentEdit(
                                          student.id
                                        )
                                      }
                                      style={({
                                        pressed,
                                      }) => [
                                        styles.actionButton,

                                        isEditing &&
                                          styles.actionButtonActive,

                                        pressed &&
                                          styles.pressedOpacity,
                                      ]}
                                    >
                                      {isLoadingEdit ? (
                                        <ActivityIndicator
                                          size="small"
                                          color={
                                            colors.primary
                                          }
                                        />
                                      ) : (
                                        <>
                                          <MaterialCommunityIcons
                                            name={
                                              isEditing
                                                ? "close"
                                                : "pencil-outline"
                                            }
                                            size={
                                              16
                                            }
                                            color={
                                              colors.primary
                                            }
                                          />

                                          <Text
                                            style={
                                              styles.actionButtonText
                                            }
                                          >
                                            {isEditing
                                              ? "Close"
                                              : "Edit"}
                                          </Text>
                                        </>
                                      )}
                                    </Pressable>
                                  ) : null}

                                  {canManageGroups ? (
                                    <Pressable
                                      accessibilityRole="button"
                                      accessibilityLabel={`Remove ${student.name} from group`}
                                      disabled={
                                        isRemoving
                                      }
                                      onPress={() =>
                                        handleRemoveStudent(
                                          student.id
                                        )
                                      }
                                      style={({
                                        pressed,
                                      }) => [
                                        styles.removeStudentButton,

                                        pressed &&
                                          styles.pressedOpacity,
                                      ]}
                                    >
                                      {isRemoving ? (
                                        <ActivityIndicator
                                          size="small"
                                          color={
                                            colors.danger
                                          }
                                        />
                                      ) : (
                                        <>
                                          <MaterialCommunityIcons
                                            name="account-minus-outline"
                                            size={
                                              16
                                            }
                                            color={
                                              colors.danger
                                            }
                                          />

                                          <Text
                                            style={
                                              styles.removeStudentText
                                            }
                                          >
                                            Remove
                                          </Text>
                                        </>
                                      )}
                                    </Pressable>
                                  ) : null}
                                </View>
                              </View>

                              {isEditing &&
                              studentEditForm ? (
                                <StudentEditPanel
                                  studentName={
                                    student.name
                                  }
                                  form={
                                    studentEditForm
                                  }
                                  onChange={
                                    updateStudentField
                                  }
                                  onSave={() =>
                                    saveStudentEdit(
                                      student.id
                                    )
                                  }
                                  onCancel={
                                    closeStudentEditor
                                  }
                                  saving={
                                    savingStudentId ===
                                    student.id
                                  }
                                />
                              ) : null}
                            </View>
                          );
                        }
                      )}
                    </View>
                  )}
                </Card>
              )}
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <Card style={styles.summaryCard}>
      <View
        style={styles.summaryIcon}
      >
        <MaterialCommunityIcons
          name={icon}
          size={23}
          color={colors.primary}
        />
      </View>

      <View
        style={styles.summaryContent}
      >
        <Text
          style={styles.summaryValue}
        >
          {value}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.summaryLabel}
        >
          {label}
        </Text>
      </View>
    </Card>
  );
}

function StudentEditPanel({
  studentName,
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <View style={styles.editPanel}>
      <View
        style={
          styles.editPanelHeader
        }
      >
        <View
          style={
            styles.editPanelHeaderIcon
          }
        >
          <MaterialCommunityIcons
            name="account-edit-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.flexOne}>
          <Text
            style={styles.editPanelTitle}
          >
            Edit {studentName}
          </Text>

          <Text
            style={
              styles.editPanelDescription
            }
          >
            Update the student and parent
            contact information below.
          </Text>
        </View>
      </View>

      <View
        style={styles.accessCodeBox}
      >
        <View
          style={styles.accessCodeIcon}
        >
          <MaterialCommunityIcons
            name="key-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View
          style={
            styles.accessCodeContent
          }
        >
          <Text
            style={styles.accessCodeLabel}
          >
            Parent access code
          </Text>

          <Text
            selectable
            style={styles.accessCodeValue}
          >
            {form.accessCode ||
              "Not available"}
          </Text>

          <Text
            style={styles.accessCodeHelp}
          >
            Send this read-only code to the
            parent so they can view the
            student's information and
            performance.
          </Text>
        </View>
      </View>

      <View style={styles.editFields}>
        <InternationalPhoneField
          label="Student phone"
          optional
          value={form.studentPhone}
          onChangeText={(value) =>
            onChange(
              "studentPhone",
              value
            )
          }
          countryCode={
            form.studentPhoneCountry
              .countryCode
          }
          callingCode={
            form.studentPhoneCountry
              .callingCode
          }
          onSelectCountry={(country) =>
            onChange(
              "studentPhoneCountry",
              country
            )
          }
        />

        <View
          style={
            styles.parentFieldsGrid
          }
        >
          <View
            style={
              styles.parentFieldColumn
            }
          >
            <Input
              label="Father's name"
              value={form.fatherName}
              onChangeText={(value) =>
                onChange(
                  "fatherName",
                  value
                )
              }
              placeholder="Father's full name"
              autoCapitalize="words"
            />

            <InternationalPhoneField
              label="Father's phone"
              optional
              value={form.fatherPhone}
              onChangeText={(value) =>
                onChange(
                  "fatherPhone",
                  value
                )
              }
              countryCode={
                form.fatherPhoneCountry
                  .countryCode
              }
              callingCode={
                form.fatherPhoneCountry
                  .callingCode
              }
              onSelectCountry={(
                country
              ) =>
                onChange(
                  "fatherPhoneCountry",
                  country
                )
              }
            />
          </View>

          <View
            style={
              styles.parentFieldColumn
            }
          >
            <Input
              label="Mother's name"
              value={form.motherName}
              onChangeText={(value) =>
                onChange(
                  "motherName",
                  value
                )
              }
              placeholder="Mother's full name"
              autoCapitalize="words"
            />

            <InternationalPhoneField
              label="Mother's phone"
              optional
              value={form.motherPhone}
              onChangeText={(value) =>
                onChange(
                  "motherPhone",
                  value
                )
              }
              countryCode={
                form.motherPhoneCountry
                  .countryCode
              }
              callingCode={
                form.motherPhoneCountry
                  .callingCode
              }
              onSelectCountry={(
                country
              ) =>
                onChange(
                  "motherPhoneCountry",
                  country
                )
              }
            />
          </View>
        </View>
      </View>

      <View
        style={styles.editActions}
      >
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          disabled={saving}
        />

        <Button
          title={
            saving
              ? "Saving..."
              : "Save changes"
          }
          variant="secondary"
          onPress={onSave}
          loading={saving}
          disabled={saving}
        />
      </View>
    </View>
  );
}

function InternationalPhoneField({
  label,
  optional = false,
  value,
  onChangeText,
  countryCode,
  callingCode,
  onSelectCountry,
}) {
  const [
    pickerVisible,
    setPickerVisible,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const selectedCountry = useMemo(
    () =>
      COUNTRIES.find(
        (country) =>
          country.countryCode ===
          countryCode
      ) || null,
    [countryCode]
  );

  function openPicker() {
    setSearch("");
    setPickerVisible(true);
  }

  function closePicker() {
    setPickerVisible(false);
    setSearch("");
  }

  function selectCountry(country) {
    onSelectCountry({
      countryCode:
        country.countryCode,
      callingCode:
        country.callingCode,
    });

    closePicker();
  }

  return (
    <View style={styles.phoneField}>
      <View
        style={styles.fieldLabelRow}
      >
        <Text
          style={styles.fieldLabel}
        >
          {label}
        </Text>

        {optional ? (
          <Text
            style={styles.optionalLabel}
          >
            Optional
          </Text>
        ) : null}
      </View>

      <View
        style={
          styles.phoneInputContainer
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select country calling code"
          onPress={openPicker}
          style={({ pressed }) => [
            styles.countryButton,

            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <Text
            style={styles.countryFlag}
          >
            {selectedCountry?.flag ||
              "🌍"}
          </Text>

          <Text
            style={styles.callingCode}
          >
            +{callingCode}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={17}
            color={colors.textMuted}
          />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={(text) =>
            onChangeText(
              sanitizePhoneInput(text)
            )
          }
          placeholder="Phone number"
          placeholderTextColor={
            colors.textMuted
          }
          keyboardType="phone-pad"
          autoComplete="tel"
          style={
            styles.phoneTextInput
          }
        />
      </View>

      <CountrySelectionModal
        visible={pickerVisible}
        selectedCountryCode={
          countryCode
        }
        search={search}
        onSearchChange={setSearch}
        onSelect={selectCountry}
        onClose={closePicker}
      />
    </View>
  );
}

function CountrySelectionModal({
  visible,
  selectedCountryCode,
  search,
  onSearchChange,
  onSelect,
  onClose,
}) {
  const filteredCountries =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return COUNTRIES;
      }

      const normalizedCallingCode =
        query.replace(/^\+/, "");

      return COUNTRIES.filter(
        (country) => {
          return (
            country.name
              .toLowerCase()
              .includes(query) ||
            country.countryCode
              .toLowerCase()
              .includes(query) ||
            country.callingCode.includes(
              normalizedCallingCode
            )
          );
        }
      );
    }, [search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View
        style={styles.modalRoot}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close country selector"
          onPress={onClose}
          style={
            styles.modalBackdrop
          }
        />

        <View
          style={styles.modalCard}
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderIcon
              }
            >
              <MaterialCommunityIcons
                name="earth"
                size={24}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={
                styles.modalHeaderText
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Select country
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Search by country name,
                ISO code, or calling
                code.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close country selector"
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,

                pressed &&
                  styles.pressedOpacity,
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={
                  colors.textPrimary
                }
              />
            </Pressable>
          </View>

          <View
            style={
              styles.searchContainer
            }
          >
            <MaterialCommunityIcons
              name="magnify"
              size={21}
              color={
                colors.textMuted
              }
            />

            <TextInput
              value={search}
              onChangeText={
                onSearchChange
              }
              placeholder="Search countries"
              placeholderTextColor={
                colors.textMuted
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={
                styles.countrySearchInput
              }
            />

            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() =>
                  onSearchChange("")
                }
                style={({
                  pressed,
                }) => [
                  styles.clearSearchButton,

                  pressed &&
                    styles.pressedOpacity,
                ]}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={19}
                  color={
                    colors.textMuted
                  }
                />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) =>
              item.countryCode
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            contentContainerStyle={
              filteredCountries.length
                ? styles.countryListContent
                : styles.emptyCountryList
            }
            renderItem={({
              item,
            }) => {
              const selected =
                item.countryCode ===
                selectedCountryCode;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    onSelect(item)
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.countryOption,

                    selected &&
                      styles.countryOptionSelected,

                    pressed &&
                      styles.pressedOpacity,
                  ]}
                >
                  <Text
                    style={
                      styles.countryOptionFlag
                    }
                  >
                    {item.flag}
                  </Text>

                  <View
                    style={
                      styles.countryOptionDetails
                    }
                  >
                    <Text
                      numberOfLines={
                        1
                      }
                      style={[
                        styles.countryOptionName,

                        selected &&
                          styles.countryOptionNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.countryOptionCode
                      }
                    >
                      {
                        item.countryCode
                      }
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.countryOptionCallingCode,

                      selected &&
                        styles.countryOptionNameSelected,
                    ]}
                  >
                    +{item.callingCode}
                  </Text>

                  {selected ? (
                    <View
                      style={
                        styles.selectedMark
                      }
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color={
                          colors.white
                        }
                      />
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                icon="earth-off"
                title="No countries found"
                description="Try a different country name or calling code."
                compact
              />
            }
          />
        </View>
      </View>
    </Modal>
  );
}

function SearchInput({
  value,
  onChangeText,
  placeholder,
  style,
}) {
  return (
    <View
      style={[
        styles.searchInput,
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={19}
        color={colors.textMuted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          colors.textMuted
        }
        autoCapitalize="none"
        autoCorrect={false}
        style={
          styles.searchTextInput
        }
      />

      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          onPress={() =>
            onChangeText("")
          }
          style={({ pressed }) => [
            styles.searchClearButton,

            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <MaterialCommunityIcons
            name="close"
            size={17}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  compact = false,
}) {
  return (
    <View
      style={[
        styles.sectionHeader,

        compact &&
          styles.sectionHeaderCompact,
      ]}
    >
      <View
        style={styles.sectionTitleRow}
      >
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors.primary}
          />
        ) : null}

        <Text
          style={styles.sectionTitle}
        >
          {title}
        </Text>
      </View>

      {description ? (
        <Text
          style={
            styles.sectionDescription
          }
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function SelectionChip({
  label,
  selected,
  disabled,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionChip,

        selected &&
          styles.selectionChipSelected,

        disabled &&
          styles.disabledOpacity,

        pressed &&
          !disabled &&
          styles.pressedOpacity,
      ]}
    >
      <MaterialCommunityIcons
        name={
          selected
            ? "calendar-check"
            : "calendar-blank-outline"
        }
        size={17}
        color={
          selected
            ? colors.white
            : colors.textMuted
        }
      />

      <Text
        numberOfLines={2}
        style={[
          styles.selectionChipText,

          selected &&
            styles.selectionChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CountBadge({
  value,
  label,
}) {
  return (
    <View
      style={styles.countBadge}
    >
      <Text
        style={styles.countBadgeValue}
      >
        {value}
      </Text>

      <Text
        style={styles.countBadgeLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function MetaPill({
  icon,
  label,
}) {
  return (
    <View
      style={styles.metaPill}
    >
      <MaterialCommunityIcons
        name={icon}
        size={14}
        color={colors.textMuted}
      />

      <Text
        style={styles.metaPillText}
      >
        {label}
      </Text>
    </View>
  );
}

function Avatar({
  name,
  large = false,
}) {
  return (
    <View
      style={[
        styles.avatar,

        large && styles.avatarLarge,
      ]}
    >
      <Text
        style={[
          styles.avatarText,

          large &&
            styles.avatarTextLarge,
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

function InlineEmpty({
  icon,
  text,
}) {
  return (
    <View
      style={styles.inlineEmpty}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={colors.textMuted}
      />

      <Text
        style={styles.inlineEmptyText}
      >
        {text}
      </Text>
    </View>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={styles.errorBanner}
    >
      <View
        style={styles.errorIcon}
      >
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={22}
          color={colors.danger}
        />
      </View>

      <Text
        style={styles.errorText}
      >
        {message}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss error"
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.errorDismiss,

          pressed &&
            styles.pressedOpacity,
        ]}
      >
        <MaterialCommunityIcons
          name="close"
          size={20}
          color={colors.danger}
        />
      </Pressable>
    </View>
  );
}

function LoadingPanel({
  message,
}) {
  return (
    <View
      style={styles.loadingPanel}
    >
      <ActivityIndicator
        color={colors.primary}
        size="small"
      />

      <Text
        style={
          styles.loadingPanelText
        }
      >
        {message}
      </Text>
    </View>
  );
}

function EmptyState({
  icon = "inbox-outline",
  title,
  description,
  compact = false,
}) {
  return (
    <View
      style={[
        styles.emptyState,

        compact &&
          styles.emptyStateCompact,
      ]}
    >
      <View
        style={styles.emptyIcon}
      >
        <MaterialCommunityIcons
          name={icon}
          size={26}
          color={colors.textMuted}
        />
      </View>

      <Text
        style={styles.emptyTitle}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={
            styles.emptyDescription
          }
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function buildStudentEditForm(
  student
) {
  const studentPhone =
    splitPhoneNumber(
      student.studentPhone ||
        student.phone
    );

  const fatherPhone =
    splitPhoneNumber(
      student.fatherPhone
    );

  const motherPhone =
    splitPhoneNumber(
      student.motherPhone
    );

  return {
    ...EMPTY_STUDENT_FORM,

    accessCode:
      student.accessCode || "",

    studentPhone:
      studentPhone.localNumber,

    studentPhoneCountry:
      studentPhone.country,

    fatherName:
      student.fatherName || "",

    fatherPhone:
      fatherPhone.localNumber,

    fatherPhoneCountry:
      fatherPhone.country,

    motherName:
      student.motherName || "",

    motherPhone:
      motherPhone.localNumber,

    motherPhoneCountry:
      motherPhone.country,
  };
}

function splitPhoneNumber(value) {
  if (!value) {
    return {
      country: DEFAULT_COUNTRY,
      localNumber: "",
    };
  }

  try {
    const parsed =
      parsePhoneNumberFromString(
        value
      );

    if (!parsed) {
      return {
        country: DEFAULT_COUNTRY,
        localNumber: value,
      };
    }

    const countryCode =
      parsed.country ||
      DEFAULT_COUNTRY.countryCode;

    const selectedCountry =
      COUNTRIES.find(
        (country) =>
          country.countryCode ===
          countryCode
      ) || DEFAULT_COUNTRY;

    return {
      country: {
        countryCode,

        callingCode:
          selectedCountry.callingCode ||
          parsed.countryCallingCode ||
          DEFAULT_COUNTRY.callingCode,
      },

      localNumber:
        parsed.nationalNumber || "",
    };
  } catch {
    return {
      country: DEFAULT_COUNTRY,
      localNumber: value,
    };
  }
}

function validateStudentEditForm(
  form
) {
  const phoneFields = [
    {
      label: "student phone",
      value: form.studentPhone,
      country:
        form.studentPhoneCountry,
    },

    {
      label: "father's phone",
      value: form.fatherPhone,
      country:
        form.fatherPhoneCountry,
    },

    {
      label: "mother's phone",
      value: form.motherPhone,
      country:
        form.motherPhoneCountry,
    },
  ];

  for (const phone of phoneFields) {
    if (
      phone.value.trim() &&
      !isPhoneNumberValid(
        buildInternationalPhoneNumber(
          phone.country.callingCode,
          phone.value
        )
      )
    ) {
      return `Enter a valid ${phone.label}.`;
    }
  }

  return "";
}

function normalizeOptionalPhone(
  country,
  localNumber
) {
  if (!localNumber.trim()) {
    return null;
  }

  return normalizePhoneNumber(
    country.callingCode,
    localNumber
  );
}

function sanitizePhoneInput(value) {
  return value.replace(
    /[^\d\s()-]/g,
    ""
  );
}

function buildInternationalPhoneNumber(
  callingCode,
  localNumber
) {
  const digits =
    localNumber.replace(
      /\D/g,
      ""
    );

  const withoutLeadingZero =
    digits.replace(/^0+/, "");

  return `+${callingCode}${withoutLeadingZero}`;
}

function normalizePhoneNumber(
  callingCode,
  localNumber
) {
  const internationalNumber =
    buildInternationalPhoneNumber(
      callingCode,
      localNumber
    );

  const parsed =
    parsePhoneNumberFromString(
      internationalNumber
    );

  return (
    parsed?.number ||
    internationalNumber
  );
}

function isPhoneNumberValid(
  phoneNumber
) {
  try {
    return isValidPhoneNumber(
      phoneNumber
    );
  } catch {
    return false;
  }
}

function getRequestError(
  error,
  fallback
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import countriesData from "world-countries";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  studentPhone: "",
};

const OTHER_SCHOOL_ID = "__OTHER_SCHOOL__";

const DEFAULT_COUNTRY = {
  countryCode: "EG",
  callingCode: "20",
};

const PARENT_MODES = [
  {
    key: "FATHER",
    label: "Father only",
  },
  {
    key: "MOTHER",
    label: "Mother only",
  },
  {
    key: "BOTH",
    label: "Both parents",
  },
];



const COUNTRIES = countriesData
  .flatMap((country) => {
    const root = country.idd?.root || "";
    const suffixes = country.idd?.suffixes || [];

    if (!root) {
      return [];
    }

    /*
     * Countries such as the United States and Canada share
     * the same calling-code root. For this form, displaying
     * the shared root is sufficient because the user enters
     * the remaining national number.
     */
    const callingCode =
      suffixes.length === 1
        ? `${root}${suffixes[0]}`
        : root;

    const normalizedCallingCode =
      callingCode.replace(/\+/g, "");

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
  .sort((first, second) =>
    first.name.localeCompare(second.name)
  );

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);

  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [otherSchoolName, setOtherSchoolName] =
    useState("");
  const [schoolsLoading, setSchoolsLoading] =
    useState(true);
  const [schoolsError, setSchoolsError] =
    useState("");

  const [years, setYears] = useState([]);
  const [desiredYearId, setDesiredYearId] =
    useState(null);
  const [yearsLoading, setYearsLoading] =
    useState(true);
  const [yearsError, setYearsError] =
    useState("");

  const [studentCountry, setStudentCountry] =
    useState(DEFAULT_COUNTRY);

  const [parentMode, setParentMode] =
    useState(null);

  const [fatherName, setFatherName] =
    useState("");
  const [fatherPhone, setFatherPhone] =
    useState("");
  const [fatherCountry, setFatherCountry] =
    useState(DEFAULT_COUNTRY);

  const [motherName, setMotherName] =
    useState("");
  const [motherPhone, setMotherPhone] =
    useState("");
  const [motherCountry, setMotherCountry] =
    useState(DEFAULT_COUNTRY);

  const [accessCode, setAccessCode] =
    useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
  let active = true;

  async function loadInitialData() {
    setSchoolsLoading(true);
    setYearsLoading(true);
    setSchoolsError("");
    setYearsError("");

    try {
      const [
        schoolsResponse,
        yearsResponse,
      ] = await Promise.all([
        api.get("/schools"),
        api.get("/auth/registration-years"),
      ]);

      if (!active) {
        return;
      }

      setSchools(
        Array.isArray(schoolsResponse.data)
          ? schoolsResponse.data
          : []
      );

      setYears(
        Array.isArray(yearsResponse.data)
          ? yearsResponse.data
          : []
      );
    } catch (requestError) {
      if (!active) {
        return;
      }

      const message =
        requestError.response?.data?.msg ||
        requestError.response?.data?.message ||
        "";

      setSchoolsError(
        message ||
          "Registration data could not be loaded."
      );

      setYearsError(
        message ||
          "Academic years could not be loaded."
      );
    } finally {
      if (active) {
        setSchoolsLoading(false);
        setYearsLoading(false);
      }
    }
  }

  loadInitialData();

  return () => {
    active = false;
  };
}, []);

  function clearError() {
    if (error) {
      setError("");
    }
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    clearError();
  }

  function selectSchool(selectedSchoolId) {
    setSchoolId(selectedSchoolId);

    if (selectedSchoolId !== OTHER_SCHOOL_ID) {
      setOtherSchoolName("");
    }

    clearError();
  }

  function updateOtherSchoolName(value) {
    setOtherSchoolName(value);
    clearError();
  }

  function selectDesiredYear(selectedYearId) {
    setDesiredYearId(selectedYearId);
    clearError();
  }

  function selectParentMode(mode) {
    setParentMode(mode);
    clearError();
  }

  function validateForm() {
    const name = form.name.trim();

    const email = form.email
      .trim()
      .toLowerCase();

    const password = form.password;

    if (!name) {
      return "Enter your full name.";
    }

    if (!email) {
      return "Enter your email address.";
    }

    if (!isValidEmail(email)) {
      return "Enter a valid email address.";
    }

    /*
     * Student phone number is mandatory.
     */
    if (!form.studentPhone.trim()) {
      return "Enter the student's phone number.";
    }

    const studentPhone =
      buildInternationalPhoneNumber(
        studentCountry.callingCode,
        form.studentPhone
      );

    if (!isPhoneNumberValid(studentPhone)) {
      return "Enter a valid student phone number.";
    }

    if (!schoolId) {
      return "Select your school.";
    }

    if (
      schoolId === OTHER_SCHOOL_ID &&
      !otherSchoolName.trim()
    ) {
      return "Enter your school name.";
    }



    if (!desiredYearId) {
      return "Select your academic year.";
    }

    if (!password) {
      return "Enter a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!parentMode) {
      return "Select at least one parent: Father, Mother, or Both.";
    }

    if (
      parentMode === "FATHER" ||
      parentMode === "BOTH"
    ) {
      if (!fatherName.trim()) {
        return "Enter the father's name.";
      }

      if (!fatherPhone.trim()) {
        return "Enter the father's phone number.";
      }

      const fatherNumber =
        buildInternationalPhoneNumber(
          fatherCountry.callingCode,
          fatherPhone
        );

      if (!isPhoneNumberValid(fatherNumber)) {
        return "Enter a valid father's phone number.";
      }
    }

    if (
      parentMode === "MOTHER" ||
      parentMode === "BOTH"
    ) {
      if (!motherName.trim()) {
        return "Enter the mother's name.";
      }

      if (!motherPhone.trim()) {
        return "Enter the mother's phone number.";
      }

      const motherNumber =
        buildInternationalPhoneNumber(
          motherCountry.callingCode,
          motherPhone
        );

      if (!isPhoneNumberValid(motherNumber)) {
        return "Enter a valid mother's phone number.";
      }
    }

    return "";
  }

  async function handleRegister() {
    if (loading) {
      return;
    }

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const includeFather =
        parentMode === "FATHER" ||
        parentMode === "BOTH";

      const includeMother =
        parentMode === "MOTHER" ||
        parentMode === "BOTH";

      const payload = {
        name: form.name.trim(),

        email: form.email
          .trim()
          .toLowerCase(),

        password: form.password,

        /*
         * Student phone is always included because
         * it is now mandatory.
         */
        studentPhone: normalizePhoneNumber(
          studentCountry.callingCode,
          form.studentPhone
        ),

        schoolId:
        schoolId === OTHER_SCHOOL_ID
          ? undefined
          : schoolId,

      otherSchoolName:
        schoolId === OTHER_SCHOOL_ID
          ? otherSchoolName.trim()
          : undefined,

      desiredYearId,


        fatherName: includeFather
          ? fatherName.trim()
          : undefined,

        fatherPhone: includeFather
          ? normalizePhoneNumber(
              fatherCountry.callingCode,
              fatherPhone
            )
          : undefined,

        motherName: includeMother
          ? motherName.trim()
          : undefined,

        motherPhone: includeMother
          ? normalizePhoneNumber(
              motherCountry.callingCode,
              motherPhone
            )
          : undefined,
      };

      await api.post(
        "/auth/register-student",
        payload
      );
      setVerificationEmail(payload.email);
      setVerificationMessage("We sent a verification link and six-digit code. Check your inbox and spam folder.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.msg ||
          requestError.response?.data?.message ||
          "Registration could not be completed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (loading || !/^\d{6}$/.test(verificationCode.trim())) {
      setError("Enter the six-digit code from your email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/verify-student-email", {
        email: verificationEmail,
        code: verificationCode.trim(),
      });
      setAccessCode(response.data?.user?.accessCode || "");
      if (!response.data?.user?.accessCode) throw new Error("Access code was not returned.");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || requestError.message || "Could not verify your email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/resend-student-verification", { email: verificationEmail });
      setVerificationMessage("If registration is pending, another email is on its way. Please wait one minute between requests.");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Could not resend the email.");
    } finally {
      setLoading(false);
    }
  }

  if (accessCode) {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
      >
        <View style={styles.successContainer}>
          <Card style={styles.successCard}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.successEyebrow}>
              REGISTRATION COMPLETE
            </Text>

            <Text style={styles.successTitle}>
              Your account is ready
            </Text>

            <Text
              style={styles.successDescription}
            >
              Save this access code. A parent can
              use it to view your academic progress
              without creating an account.
            </Text>

            <View
              style={styles.accessCodeContainer}
            >
              <Text
                style={styles.accessCodeLabel}
              >
                PARENT ACCESS CODE
              </Text>

              <Text
                selectable
                style={styles.accessCode}
              >
                {accessCode}
              </Text>
            </View>

            <View style={styles.informationBox}>
              <Text
                style={styles.informationTitle}
              >
                What happens next?
              </Text>

              <Text style={styles.informationText}>
                A teacher or assistant will add you to
                the correct dedicated group based on
                the academic year you selected.
                Contact the Team to let them add you
                to the dedicated group. Group
                resources and activities will become
                available after that.
              </Text>
            </View>

            <Button
              title="Continue to sign in"
              onPress={() =>
                router.replace("/(auth)/login")
              }
              style={styles.fullWidthButton}
            />
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (verificationEmail) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        <View style={styles.successContainer}>
          <Card style={styles.successCard}>
            <Text style={styles.successEyebrow}>VERIFY YOUR EMAIL</Text>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successDescription}>
              We sent a link and a six-digit code to {verificationEmail}. Your account will be created after verification. The code expires in 30 minutes.
            </Text>
            <Text style={styles.successDescription}>{verificationMessage}</Text>
            <TextInput
              accessibilityLabel="Six-digit verification code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Six-digit code"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.verificationInput}
            />
            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
            <Button title="Verify email and create account" onPress={handleVerifyCode} loading={loading} disabled={loading} style={styles.fullWidthButton} />
            <Button title="Resend email" onPress={handleResend} disabled={loading} style={styles.fullWidthButton} />
            <Button title="Change email or details" onPress={() => { setVerificationEmail(""); setVerificationCode(""); setError(""); }} disabled={loading} style={styles.fullWidthButton} />
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.page}
    >
      <View style={styles.registerContainer}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            STUDENT PORTAL
          </Text>

          <Text style={styles.title}>
            Create your account
          </Text>

          <Text style={styles.subtitle}>
            Register to access lessons, homework,
            quizzes, resources, and academic
            progress.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <SectionHeader
            number="1"
            title="Student information"
            description="Enter the details that will be associated with your student account."
          />

          <View style={styles.fields}>
            <Input
              label="Full name"
              value={form.name}
              onChangeText={(value) =>
                updateField("name", value)
              }
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
            />

            <Input
              label="Email address"
              value={form.email}
              onChangeText={(value) =>
                updateField("email", value)
              }
              placeholder="student@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
            />

            <InternationalPhoneField
              label="Phone number"
              value={form.studentPhone}
              onChangeText={(value) =>
                updateField(
                  "studentPhone",
                  value
                )
              }
              countryCode={
                studentCountry.countryCode
              }
              callingCode={
                studentCountry.callingCode
              }
              onSelectCountry={
                setStudentCountry
              }
            />

            <SchoolSelector
              schools={schools}
              selectedSchoolId={schoolId}
              otherSchoolName={otherSchoolName}
              loading={schoolsLoading}
              error={schoolsError}
              onSelect={selectSchool}
              onChangeOtherSchoolName={updateOtherSchoolName}
            />
            <YearSelector
              years={years}
              selectedYearId={desiredYearId}
              loading={yearsLoading}
              error={yearsError}
              onSelect={selectDesiredYear}
            />

            <View>
              <Input
                label="Password"
                value={form.password}
                onChangeText={(value) =>
                  updateField(
                    "password",
                    value
                  )
                }
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={
                  handleRegister
                }
              />

              <Text style={styles.passwordHint}>
                Use at least 6 characters.
              </Text>
            </View>
          </View>

          <View style={styles.sectionSpacing}>
            <SectionHeader
              number="2"
              title="Parent information"
              description="At least one parent is required. Select Father, Mother, or Both and provide the required contact information."
            />

            <Text style={styles.parentRequirement}>
              At least one parent is required
            </Text>
          </View>

          <View
            accessibilityRole="radiogroup"
            style={styles.selectionOptions}
          >
            {PARENT_MODES.map((mode) => {
              const selected =
                parentMode === mode.key;

              return (
                <Pressable
                  key={mode.key}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    selectParentMode(mode.key)
                  }
                  style={({ pressed }) => [
                    styles.selectionOption,
                    selected &&
                      styles.selectionOptionSelected,
                    pressed &&
                      styles.selectionOptionPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                    ]}
                  >
                    {selected ? (
                      <View
                        style={styles.radioDot}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.selectionOptionText,
                      selected &&
                        styles.selectionOptionTextSelected,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {parentMode === "FATHER" ||
          parentMode === "BOTH" ? (
            <View style={styles.parentFields}>
              <Input
                label="Father's name"
                value={fatherName}
                onChangeText={(value) => {
                  setFatherName(value);
                  clearError();
                }}
                placeholder="Enter father's full name"
                autoCapitalize="words"
                autoComplete="name"
              />

              <InternationalPhoneField
                label="Father's phone"
                value={fatherPhone}
                onChangeText={(value) => {
                  setFatherPhone(value);
                  clearError();
                }}
                countryCode={
                  fatherCountry.countryCode
                }
                callingCode={
                  fatherCountry.callingCode
                }
                onSelectCountry={
                  setFatherCountry
                }
              />
            </View>
          ) : null}

          {parentMode === "MOTHER" ||
          parentMode === "BOTH" ? (
            <View style={styles.parentFields}>
              <Input
                label="Mother's name"
                value={motherName}
                onChangeText={(value) => {
                  setMotherName(value);
                  clearError();
                }}
                placeholder="Enter mother's full name"
                autoCapitalize="words"
                autoComplete="name"
              />

              <InternationalPhoneField
                label="Mother's phone"
                value={motherPhone}
                onChangeText={(value) => {
                  setMotherPhone(value);
                  clearError();
                }}
                countryCode={
                  motherCountry.countryCode
                }
                callingCode={
                  motherCountry.callingCode
                }
                onSelectCountry={
                  setMotherCountry
                }
              />
            </View>
          ) : null}

          {error ? (
            <View
              accessibilityRole="alert"
              style={styles.errorBanner}
            >
              <View
                style={styles.errorIndicator}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Button
            title="Send verification email"
            onPress={handleRegister}
            loading={loading}
            disabled={
              loading ||
              schoolsLoading ||
              yearsLoading ||
              Boolean(schoolsError) ||
              Boolean(yearsError) ||
              schools.length === 0 ||
              years.length === 0
            }
            style={styles.registerButton}
          />

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already registered?
            </Text>

            <Link
              href="/(auth)/login"
              style={styles.signInLink}
            >
              Sign in
            </Link>
          </View>
        </Card>

        <Text style={styles.footerText}>
          Your access will remain limited until you
          are assigned to a group.
        </Text>
      </View>
    </ScrollView>
  );
}

function SectionHeader({
  number,
  title,
  description,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>
          {number}
        </Text>
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionDescription}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

function SchoolSelector({
  schools,
  selectedSchoolId,
  otherSchoolName,
  loading,
  error,
  onSelect,
  onChangeOtherSchoolName,
}) {  return (
    <View style={styles.schoolSection}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          School
        </Text>

        <Text style={styles.requiredLabel}>
          Required
        </Text>
      </View>

      <Text style={styles.fieldHelpText}>
        Select the school you currently attend.
      </Text>

      {loading ? (
        <View style={styles.schoolLoading}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text
            style={styles.schoolLoadingText}
          >
            Loading schools...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.schoolError}>
          <Text
            style={styles.schoolErrorTitle}
          >
            Schools could not be loaded
          </Text>

          <Text
            style={styles.schoolErrorText}
          >
            Refresh the page and try again. A
            school must be selected before
            registration can be completed.
          </Text>
        </View>
      ) : null}

      {!loading &&
        !error &&
        schools.length === 0 ? (
          <View style={styles.schoolError}>
            <Text style={styles.schoolErrorTitle}>
              No schools are available
            </Text>

            <Text style={styles.schoolErrorText}>
              Select Other below and enter your school
              name manually.
            </Text>
          </View>
        ) : null}

      {!loading && !error ? (
        <View
          accessibilityRole="radiogroup"
          style={styles.selectionOptions}
        >
          {schools.map((school) => {
            const selected =
              selectedSchoolId === school.id;

            return (
              <Pressable
                key={school.id}
                accessibilityRole="radio"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  onSelect(school.id)
                }
                style={({ pressed }) => [
                  styles.selectionOption,
                  selected &&
                    styles.selectionOptionSelected,
                  pressed &&
                    styles.selectionOptionPressed,
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    selected &&
                      styles.radioSelected,
                  ]}
                >
                  {selected ? (
                    <View
                      style={styles.radioDot}
                    />
                  ) : null}
                </View>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.selectionOptionText,
                    selected &&
                      styles.selectionOptionTextSelected,
                  ]}
                >
                  {school.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            key={OTHER_SCHOOL_ID}
            accessibilityRole="radio"
            accessibilityState={{
              selected:
                selectedSchoolId === OTHER_SCHOOL_ID,
            }}
            onPress={() =>
              onSelect(OTHER_SCHOOL_ID)
            }
            style={({ pressed }) => [
              styles.selectionOption,
              selectedSchoolId === OTHER_SCHOOL_ID &&
                styles.selectionOptionSelected,
              pressed &&
                styles.selectionOptionPressed,
            ]}
          >
            <View
              style={[
                styles.radio,
                selectedSchoolId === OTHER_SCHOOL_ID &&
                  styles.radioSelected,
              ]}
            >
              {selectedSchoolId === OTHER_SCHOOL_ID ? (
                <View style={styles.radioDot} />
              ) : null}
            </View>

            <Text
              numberOfLines={2}
              style={[
                styles.selectionOptionText,
                selectedSchoolId === OTHER_SCHOOL_ID &&
                  styles.selectionOptionTextSelected,
              ]}
            >
              Other school
            </Text>
          </Pressable>

          {selectedSchoolId === OTHER_SCHOOL_ID ? (
            <View style={styles.otherSchoolBox}>
              <Input
                label="School name"
                value={otherSchoolName}
                onChangeText={onChangeOtherSchoolName}
                placeholder="Enter your school name"
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={styles.fieldHelpText}>
                If your school is not listed, write its
                name here and the team will review it.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function YearSelector({
  years,
  selectedYearId,
  loading,
  error,
  onSelect,
}) {
  return (
    <View style={styles.schoolSection}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          Academic year
        </Text>

        <Text style={styles.requiredLabel}>
          Required
        </Text>
      </View>

      <Text style={styles.fieldHelpText}>
        Select the academic year you want to join.
        The team will use this to add you to the
        correct dedicated group.
      </Text>

      {loading ? (
        <View style={styles.schoolLoading}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text style={styles.schoolLoadingText}>
            Loading academic years...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.schoolError}>
          <Text style={styles.schoolErrorTitle}>
            Academic years could not be loaded
          </Text>

          <Text style={styles.schoolErrorText}>
            Refresh the page and try again. An
            academic year must be selected before
            registration can be completed.
          </Text>
        </View>
      ) : null}

      {!loading &&
      !error &&
      years.length === 0 ? (
        <View style={styles.schoolError}>
          <Text style={styles.schoolErrorTitle}>
            No academic years are available
          </Text>

          <Text style={styles.schoolErrorText}>
            Registration cannot continue until an
            academic year has been created by the
            teacher.
          </Text>
        </View>
      ) : null}

      {!loading &&
      !error &&
      years.length > 0 ? (
        <View
          accessibilityRole="radiogroup"
          style={styles.selectionOptions}
        >
          {years.map((year) => {
            const selected =
              selectedYearId === year.id;

            return (
              <Pressable
                key={year.id}
                accessibilityRole="radio"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  onSelect(year.id)
                }
                style={({ pressed }) => [
                  styles.selectionOption,
                  selected &&
                    styles.selectionOptionSelected,
                  pressed &&
                    styles.selectionOptionPressed,
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    selected &&
                      styles.radioSelected,
                  ]}
                >
                  {selected ? (
                    <View style={styles.radioDot} />
                  ) : null}
                </View>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.selectionOptionText,
                    selected &&
                      styles.selectionOptionTextSelected,
                  ]}
                >
                  {year.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
  const [pickerVisible, setPickerVisible] =
    useState(false);

  const [search, setSearch] = useState("");

  const selectedCountry = useMemo(
    () =>
      COUNTRIES.find(
        (country) =>
          country.countryCode === countryCode
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
      countryCode: country.countryCode,
      callingCode: country.callingCode,
    });

    closePicker();
  }

  return (
    <View style={styles.phoneField}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          {label}
        </Text>

        <Text
          style={
            optional
              ? styles.optionalLabel
              : styles.requiredLabel
          }
        >
          {optional ? "Optional" : "Required"}
        </Text>
      </View>

      <View style={styles.phoneInputContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select country calling code"
          onPress={openPicker}
          style={({ pressed }) => [
            styles.countryButton,
            pressed &&
              styles.countryButtonPressed,
          ]}
        >
          <Text style={styles.countryFlag}>
            {selectedCountry?.flag || "🌍"}
          </Text>

          <Text style={styles.callingCode}>
            +{callingCode}
          </Text>

          <Text style={styles.countryChevron}>
            ▾
          </Text>
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
          style={styles.phoneTextInput}
        />
      </View>

      <Text style={styles.fieldHelpText}>
        Select the country code, then enter the
        phone number.
      </Text>

      <CountrySelectionModal
        visible={pickerVisible}
        selectedCountryCode={countryCode}
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
  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return COUNTRIES;
    }

    const normalizedCallingCode =
      query.replace(/^\+/, "");

    return COUNTRIES.filter((country) => {
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
    });
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
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close country selector"
          onPress={onClose}
          style={styles.modalBackdrop}
        />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Select country
              </Text>

              <Text style={styles.modalSubtitle}>
                Search by country, ISO code, or
                calling code.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close country selector"
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed &&
                  styles.modalCloseButtonPressed,
              ]}
            >
              <Text
                style={styles.modalCloseText}
              >
                ×
              </Text>
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>
              ⌕
            </Text>

            <TextInput
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search countries"
              placeholderTextColor={
                colors.textMuted
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.countrySearchInput}
            />

            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear country search"
                onPress={() =>
                  onSearchChange("")
                }
                style={({ pressed }) => [
                  styles.clearSearchButton,
                  pressed && {
                    opacity: 0.65,
                  },
                ]}
              >
                <Text
                  style={styles.clearSearchText}
                >
                  ×
                </Text>
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
            renderItem={({ item }) => {
              const selected =
                item.countryCode ===
                selectedCountryCode;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.countryOption,
                    selected &&
                      styles.countryOptionSelected,
                    pressed &&
                      styles.countryOptionPressed,
                  ]}
                >
                  <Text
                    style={styles.countryOptionFlag}
                  >
                    {item.flag}
                  </Text>

                  <View
                    style={
                      styles.countryOptionDetails
                    }
                  >
                    <Text
                      numberOfLines={1}
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
                      {item.countryCode}
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
                      style={styles.selectedMark}
                    >
                      <Text
                        style={
                          styles.selectedMarkText
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>
                  No countries found
                </Text>

                <Text style={styles.emptyStateText}>
                  Try another country name or
                  calling code.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

function sanitizePhoneInput(value) {
  return value.replace(/[^\d\s()-]/g, "");
}

function buildInternationalPhoneNumber(
  callingCode,
  localNumber
) {
  const digits = localNumber.replace(/\D/g, "");

  const numberWithoutLeadingZero =
    digits.replace(/^0+/, "");

  return `+${callingCode}${numberWithoutLeadingZero}`;
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

  const parsedNumber =
    parsePhoneNumberFromString(
      internationalNumber
    );

  return (
    parsedNumber?.number ||
    internationalNumber
  );
}

function isPhoneNumberValid(phoneNumber) {
  try {
    return isValidPhoneNumber(phoneNumber);
  } catch {
    return false;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },

  otherSchoolBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}08`,
  },

  registerContainer: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    maxWidth: 440,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  formCard: {
    width: "100%",
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: spacing.md,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionSpacing: {
    marginTop: spacing.xl,
  },

  stepBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },

  stepBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  sectionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  fields: {
    gap: spacing.md,
  },

  passwordHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },

  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },

  fieldLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  optionalLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  requiredLabel: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: "700",
  },

  fieldHelpText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.xs,
  },

  phoneField: {
    width: "100%",
  },

  phoneInputContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  countryButton: {
    minWidth: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
  },

  countryButtonPressed: {
    opacity: 0.72,
  },

  countryFlag: {
    fontSize: 22,
  },

  callingCode: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },

  countryChevron: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  phoneTextInput: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,

    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
        }
      : null),
  },

  schoolSection: {
    width: "100%",
  },

  schoolLoading: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  schoolLoadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  schoolError: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.danger}60`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
  },

  schoolErrorTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    marginBottom: 3,
  },

  schoolErrorText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  selectionOptions: {
    gap: spacing.xs,
  },

  selectionOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  selectionOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },

  selectionOptionPressed: {
    opacity: 0.78,
  },

  selectionOptionText: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },

  selectionOptionTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },

  radio: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    marginRight: spacing.sm,
  },

  radioSelected: {
    borderColor: colors.primary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  parentFields: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "hidden",
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.danger}60`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
  },

  errorIndicator: {
    alignSelf: "stretch",
    width: 4,
    backgroundColor: colors.danger,
  },

  errorText: {
    ...typography.body,
    flex: 1,
    color: colors.danger,
    padding: spacing.sm,
    lineHeight: 20,
  },

  parentRequirement: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },

  registerButton: {
    width: "100%",
    marginTop: spacing.lg,
  },

  fullWidthButton: {
    width: "100%",
  },

  signInRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.lg,
  },

  signInText: {
    ...typography.body,
    color: colors.textMuted,
  },

  signInLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },

  successContainer: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  verificationInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },

  successCard: {
    width: "100%",
    alignItems: "center",
    padding: spacing.xl,
  },

  successIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: `${colors.secondary}25`,
    marginBottom: spacing.md,
  },

  successIconText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.secondary,
  },

  successEyebrow: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  successTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  successDescription: {
    ...typography.body,
    maxWidth: 390,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  accessCodeContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.warning}60`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
    marginBottom: spacing.lg,
  },

  accessCodeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },

  accessCode: {
    ...typography.h1,
    color: colors.warning,
    textAlign: "center",
    letterSpacing: 3,
  },

  informationBox: {
    width: "100%",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },

  informationTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  informationText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 24, 39, 0.72)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 500,
    height: "80%",
    maxHeight: 640,
    minHeight: 420,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,

    ...(Platform.OS === "web"
      ? {
          boxShadow:
            "0 24px 80px rgba(0, 0, 0, 0.35)",
        }
      : {
          elevation: 24,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.3,
          shadowRadius: 24,
        }),
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },

  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.background,
  },

  modalCloseButtonPressed: {
    opacity: 0.65,
  },

  modalCloseText: {
    fontSize: 26,
    lineHeight: 28,
    color: colors.textPrimary,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  searchIcon: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },

  countrySearchInput: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,

    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
        }
      : null),
  },

  clearSearchButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    borderRadius: 17,
  },

  clearSearchText: {
    fontSize: 22,
    color: colors.textMuted,
  },

  countryListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  countryOption: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  countryOptionSelected: {
    borderBottomColor: "transparent",
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}0D`,
  },

  countryOptionPressed: {
    opacity: 0.68,
  },

  countryOptionFlag: {
    width: 42,
    fontSize: 25,
  },

  countryOptionDetails: {
    flex: 1,
    minWidth: 0,
  },

  countryOptionName: {
    ...typography.body,
    color: colors.textPrimary,
  },

  countryOptionNameSelected: {
    color: colors.primary,
    fontWeight: "700",
  },

  countryOptionCode: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  countryOptionCallingCode: {
    ...typography.bodyBold,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },

  selectedMark: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },

  selectedMarkText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },

  emptyCountryList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyState: {
    alignItems: "center",
  },

  emptyStateTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  emptyStateText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});

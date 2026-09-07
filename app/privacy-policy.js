import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Stack } from "expo-router";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../src/theme";

const LAST_UPDATED = "07/09/2026";

export default function PrivacyPolicy() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Privacy Policy",
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              MAHMOUD NAGY PLATFORM
            </Text>

            <Text style={styles.title}>
              Privacy Policy
            </Text>

            <Text style={styles.updated}>
              Last updated: {LAST_UPDATED}
            </Text>

            <Text style={styles.intro}>
              This Privacy Policy explains how Mahmoud Nagy Platform collects,
              uses, stores, and protects information when students, teachers,
              assistants, and parents use our website and mobile application.
            </Text>
          </View>

          <Section title="1. Who we are">
            <Paragraph>
              Mahmoud Nagy Platform is an educational platform used to manage
              lessons, groups, resources, assignments, quizzes, student
              performance, communication, and parent access for educational
              purposes.
            </Paragraph>

            <Paragraph>
              The platform is available through the website and Android mobile
              application. This Privacy Policy applies to both.
            </Paragraph>
          </Section>

          <Section title="2. Information we collect">
            <Paragraph>
              We may collect the following types of information depending on
              the user role and how the platform is used:
            </Paragraph>

            <Bullet text="Account information such as name, phone number, email address, role, login credentials, and student access code." />
            <Bullet text="Student information such as academic year, group, attendance mode, attendance records, task submissions, quiz results, grades, performance records, and parent/guardian contact details." />
            <Bullet text="Teacher and assistant information such as account details, role permissions, assigned groups, uploaded resources, and messages." />
            <Bullet text="Parent access information such as the student access code used to view the student’s parent page, performance, and support chat." />
            <Bullet text="Uploaded educational content such as PDFs, images, videos, assignments, student answers, and correction-related files." />
            <Bullet text="Chat and support messages exchanged between students, teachers, assistants, and parents." />
            <Bullet text="Technical information such as device type, browser type, app version, IP address, error logs, and usage activity needed for security, troubleshooting, and service operation." />
          </Section>

          <Section title="3. How we use information">
            <Paragraph>
              We use collected information to operate and improve the
              educational platform, including:
            </Paragraph>

            <Bullet text="Creating and managing user accounts." />
            <Bullet text="Assigning students to academic years, groups, lessons, tasks, and quizzes." />
            <Bullet text="Displaying resources, videos, homework, grades, attendance, and performance statistics." />
            <Bullet text="Allowing communication through group chats and student support chats." />
            <Bullet text="Allowing parents to access student progress and support chat using the student access code." />
            <Bullet text="Processing uploaded files and educational materials." />
            <Bullet text="Providing AI-assisted correction and feedback when a teacher uploads a question paper, mark scheme, and student answer." />
            <Bullet text="Maintaining security, preventing unauthorized access, debugging errors, and improving platform reliability." />
          </Section>

          <Section title="4. Parent access by student code">
            <Paragraph>
              The platform may allow parents or guardians to access a student’s
              parent view using the student access code. This code allows access
              to that student’s progress information and private support chat.
            </Paragraph>

            <Paragraph>
              The student access code must be kept private. Anyone who receives
              the code may be able to access the related parent view. Teachers
              or platform administrators may regenerate or revoke access codes
              when needed.
            </Paragraph>
          </Section>

          <Section title="5. Files, videos, and educational content">
            <Paragraph>
              Teachers and authorized assistants may upload educational files
              such as videos, PDFs, images, assignments, and learning materials.
              Students may upload submissions or answers where required.
            </Paragraph>

            <Paragraph>
              Files may be stored using third-party cloud storage services such
              as Cloudflare R2. In some cases, teachers may also provide
              external video links such as Google Drive links. Access to these
              files is controlled according to the user’s role and permissions.
            </Paragraph>
          </Section>

          <Section title="6. AI correction and third-party processing">
            <Paragraph>
              The platform may include an AI correction feature that allows a
              teacher to upload a question paper, mark scheme, and student
              answer PDF to generate marking suggestions and feedback.
            </Paragraph>

            <Paragraph>
              When this feature is used, the uploaded documents may be sent to
              a third-party AI provider, such as Google Gemini, for processing.
              AI-generated results are intended to assist the teacher and should
              be reviewed by the teacher before being used as final academic
              judgment.
            </Paragraph>
          </Section>

          <Section title="7. Sharing of information">
            <Paragraph>
              We do not sell personal information. Information may be shared
              only when necessary to provide the platform services, including:
            </Paragraph>

            <Bullet text="With teachers and assistants who are authorized to manage a student’s group or educational activity." />
            <Bullet text="With parents or guardians who use the student access code to view the related student’s progress and support chat." />
            <Bullet text="With service providers used for hosting, database, file storage, email, analytics, error monitoring, or AI processing." />
            <Bullet text="When required by law, legal process, or to protect the security and rights of the platform and its users." />
          </Section>

          <Section title="8. Data security">
            <Paragraph>
              We use reasonable technical and organizational measures to protect
              user information against unauthorized access, loss, misuse, or
              alteration. These measures may include authentication, role-based
              permissions, secure hosting, encrypted connections, and access
              controls.
            </Paragraph>

            <Paragraph>
              No online system can be guaranteed to be completely secure. Users
              should protect their login credentials and student access codes.
            </Paragraph>
          </Section>

          <Section title="9. Data retention">
            <Paragraph>
              We keep information for as long as needed to provide the
              educational service, maintain records, comply with legal
              obligations, resolve disputes, and support platform operations.
            </Paragraph>

            <Paragraph>
              Uploaded files, messages, grades, submissions, and performance
              data may remain stored while the student or teacher relationship
              is active, unless deletion is requested and approved where
              applicable.
            </Paragraph>
          </Section>

          <Section title="10. Children and students">
            <Paragraph>
              Mahmoud Nagy Platform is an education platform used by students.
              Student data is used only for educational, administrative,
              communication, and performance-tracking purposes.
            </Paragraph>

            <Paragraph>
              Parents or guardians may contact the teacher or platform
              administrator to request help regarding access, correction, or
              deletion of student information where applicable.
            </Paragraph>
          </Section>

          <Section title="11. User choices and rights">
            <Paragraph>
              Depending on applicable law and platform rules, users may request
              access to their information, correction of inaccurate information,
              deletion of certain information, or restriction of access.
            </Paragraph>

            <Paragraph>
              Some information may need to be retained for educational records,
              security, legal compliance, or legitimate platform operation.
            </Paragraph>
          </Section>

          <Section title="12. Third-party services">
            <Paragraph>
              The platform may use third-party services for hosting, database,
              storage, email delivery, video links, AI processing, analytics,
              and error monitoring. These services may process limited
              information as needed to provide their functions.
            </Paragraph>

            <Paragraph>
              Examples may include hosting providers, Cloudflare R2, Google
              Drive, Google Gemini, email delivery services, and error
              monitoring tools.
            </Paragraph>
          </Section>

          <Section title="13. Changes to this Privacy Policy">
            <Paragraph>
              We may update this Privacy Policy from time to time. When changes
              are made, the “Last updated” date at the top of this page will be
              changed. Continued use of the platform after an update means the
              updated Privacy Policy applies.
            </Paragraph>
          </Section>

          <Section title="14. Contact us">
            <Paragraph>
              For questions about this Privacy Policy or user data, contact the
              platform administrator or teacher responsible for your account.
            </Paragraph>

            <Paragraph>
              Email: mostafa_msamir@hotmail.com
            </Paragraph>
          </Section>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Mahmoud Nagy Platform. All rights
              reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

function Paragraph({ children }) {
  return (
    <Text style={styles.paragraph}>
      {children}
    </Text>
  );
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>
        •
      </Text>

      <Text style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
  },

  page: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },

  header: {
    padding: spacing.lg,
    borderRadius: radius.xl || radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.primary,
  },

  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },

  updated: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
  },

  intro: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginTop: spacing.xs,
  },

  section: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  sectionBody: {
    gap: spacing.sm,
  },

  paragraph: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  bulletDot: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    color: colors.primary,
  },

  bulletText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
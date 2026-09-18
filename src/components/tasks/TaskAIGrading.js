import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import api from "../../lib/api";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { colors, spacing, radius } from "../../theme";

const Context = createContext(null);
const isStaff = user => ["TEACHER", "ASSISTANT"].includes(user?.role);
const canRun = user => user?.role === "TEACHER" ||
  (user?.role === "ASSISTANT" && (user.isHeadAssistant || user.permissions?.canGradeHomework === true));
const errorText = error => error?.response?.data?.msg || error?.message || "AI grading request failed.";
const formatTime = value => value ? new Date(value).toLocaleString() : "";

export function TaskAIGradingProvider({ taskId, user, children }) {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const loadPack = useCallback(async () => {
    if (!taskId || !isStaff(user) || busyRef.current) return;
    busyRef.current = true;
    try {
      const response = await api.get(`/ai-correction/tasks/${taskId}/references`);
      setPack(response.data.pack || null);
      setError("");
    } catch (requestError) { setError(errorText(requestError)); }
    finally { busyRef.current = false; setLoading(false); }
  }, [taskId, user?.id, user?.role]);
  useEffect(() => {
    setPack(null);
    setLoading(true);
    loadPack();
  }, [loadPack]);
  useEffect(() => {
    if (pack?.status !== "PROCESSING") return;
    const timer = setInterval(loadPack, 4000);
    return () => clearInterval(timer);
  }, [pack?.status, loadPack]);
  return (
    <Context.Provider value={{ taskId, user, pack, setPack, loading, error, loadPack }}>
      {children}
    </Context.Provider>
  );
}

async function appendPdf(formData, field, asset) {
  if (Platform.OS === "web") {
    const file = asset.file || await (await fetch(asset.uri)).blob();
    formData.append(field, file, asset.name || `${field}.pdf`);
  } else {
    formData.append(field, { uri: asset.uri, name: asset.name || `${field}.pdf`, type: "application/pdf" });
  }
}
function List({ title, values, warning = false }) {
  if (!values?.length) return null;
  return (
    <View style={s.list}>
      <Text style={[s.label, warning && s.warning]}>{title}</Text>
      {values.map((value, index) => <Text key={index} style={s.body}>• {value}</Text>)}
    </View>
  );
}
function RubricView({ rubric }) {
  return (
    <View style={s.stack}>
      <Text style={s.label}>Extracted marking rubric • {rubric.totalPossible} marks</Text>
      <List title="Document limitations—verify before approving" values={rubric.documentWarnings} warning />
      {rubric.questions.map(question => (
        <View key={question.question} style={s.question}>
          <Text style={s.label}>{question.question} • {question.possible} marks</Text>
          <Text style={s.body}>{question.questionText}</Text>
          <List title="Marking points and allocation" values={question.markingPoints} />
          <List title="Accepted alternatives" values={question.acceptedAnswers} />
          <List title="Common errors" values={question.commonErrors} />
          <Text style={s.muted}>{question.references}</Text>
          <List title="Needs staff verification" values={question.uncertainties} warning />
        </View>
      ))}
    </View>
  );
}

export function TaskAIReferences({ gradeOutOf }) {
  const context = useContext(Context);
  const { taskId, user, pack, setPack, loading, error, loadPack } = context || {};
  const [questionPaper, setQuestionPaper] = useState(null);
  const [markScheme, setMarkScheme] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  if (!context || !isStaff(user)) return null;

  async function pick(setFile) {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", multiple: false, copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.size > 50 * 1024 * 1024) throw new Error("Each PDF must be 50 MB or smaller.");
        setFile(asset);
        setLocalError("");
      }
    } catch (requestError) { setLocalError(errorText(requestError)); }
  }
  async function upload() {
    setBusy(true); setLocalError(""); setUploadProgress(0);
    try {
      const formData = new FormData();
      await appendPdf(formData, "questionPaper", questionPaper);
      await appendPdf(formData, "markScheme", markScheme);
      const response = await api.post(`/ai-correction/tasks/${taskId}/references`, formData, {
        timeout: 10 * 60 * 1000,
        onUploadProgress: event => {
          if (event.total) setUploadProgress(Math.round(event.loaded / event.total * 100));
        },
      });
      setPack(response.data.pack);
      setQuestionPaper(null); setMarkScheme(null); setReplacing(false); setReviewing(true);
    } catch (requestError) { setLocalError(errorText(requestError)); }
    finally { setBusy(false); }
  }
  async function action(kind) {
    setBusy(true); setLocalError("");
    try {
      const response = await api.post(`/ai-correction/tasks/${taskId}/references/${kind}`, { packId: pack.id });
      setPack(response.data.pack);
      if (kind === "approve") setReviewing(false);
    } catch (requestError) { setLocalError(errorText(requestError)); }
    finally { setBusy(false); }
  }
  async function open(kind) {
    try {
      // Renew private download links even after a long grading session.
      const response = await api.get(`/ai-correction/tasks/${taskId}/references`);
      const current = response.data.pack;
      if (!current) throw new Error("Reference documents are no longer available.");
      setPack(current);
      await Linking.openURL(kind === "questionPaper" ? current.questionPaperUrl : current.markSchemeUrl);
    } catch (requestError) { setLocalError(errorText(requestError)); }
  }
  return (
    <Card style={s.referenceCard}>
      <Text style={s.title}>AI grading • task reference documents</Text>
      <Text style={s.body}>Staff only. Save the question paper and mark scheme once for this task. Student answers come from each submission. AI suggestions never publish grades or feedback.</Text>
      <Text style={s.muted}>PDFs and selected answers are sent to Gemini for analysis. Review its work; handwriting, diagrams and scheme extraction can be wrong.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {localError || error ? (
        <View style={s.stack}>
          <Text style={s.error}>{localError || error}</Text>
          {error ? <Button title="Retry loading AI references" variant="outline" onPress={loadPack} /> : null}
        </View>
      ) : null}
      {pack ? (
        <View style={s.stack}>
          <Text style={s.label}>References saved by {pack.uploadedByName}</Text>
          <View style={s.actions}>
            <Button title={`Question paper: ${pack.questionPaperName}`} variant="outline" onPress={() => open("questionPaper")} />
            <Button title={`Mark scheme: ${pack.markSchemeName}`} variant="outline" onPress={() => open("markScheme")} />
          </View>
          {pack.status === "PROCESSING" ? (
            <Text style={s.muted}>Preparing the reusable rubric… You may leave this page and come back. This can take a few minutes.</Text>
          ) : pack.status === "FAILED" ? (
            <View style={s.stack}>
              <Text style={s.error}>{pack.error}</Text>
              {canRun(user) ? <Button title="Retry rubric preparation" loading={busy} onPress={() => action("retry")} /> : null}
            </View>
          ) : (
            <>
              <Text style={pack.approvedAt ? s.success : s.warning}>
                {pack.approvedAt ? `Rubric approved by ${pack.approvedByName} • ready to grade` : "Review the extracted rubric against both original PDFs before grading."}
              </Text>
              {Number(gradeOutOf) !== pack.rubric?.totalPossible ? (
                <Text style={s.warning}>The rubric has {pack.rubric?.totalPossible} marks; this task is configured for {gradeOutOf}. Suggested marks are not automatically scaled or saved as the task grade.</Text>
              ) : null}
              <Button title={reviewing ? "Hide marking rubric" : "Review marking rubric"} variant="outline" onPress={() => setReviewing(value => !value)} />
              {reviewing && pack.rubric ? <RubricView rubric={pack.rubric} /> : null}
              {!pack.approvedAt && reviewing && canRun(user) ? (
                <Button title="I reviewed the rubric—approve for AI grading" disabled={busy} loading={busy} onPress={() => action("approve")} />
              ) : null}
            </>
          )}
          {canRun(user) && pack.status !== "PROCESSING" ? (
            <Button title={replacing ? "Cancel replacement" : "Replace reference PDFs"} variant="outline" disabled={busy} onPress={() => setReplacing(value => !value)} />
          ) : null}
        </View>
      ) : null}
      {!loading && (!pack || replacing) && canRun(user) ? (
        <View style={s.stack}>
          <Text style={s.muted}>Upload both PDFs together. Replacing them creates a new reference version; old AI corrections remain saved but are marked outdated.</Text>
          <View style={s.actions}>
            <Button title={questionPaper?.name || "Choose question paper PDF"} variant="outline" disabled={busy} onPress={() => pick(setQuestionPaper)} />
            <Button title={markScheme?.name || "Choose mark scheme PDF"} variant="outline" disabled={busy} onPress={() => pick(setMarkScheme)} />
          </View>
          <Button title={busy ? `Saving PDFs… ${uploadProgress}%` : "Save PDFs and prepare rubric"} loading={busy} disabled={busy || !questionPaper || !markScheme} onPress={upload} />
        </View>
      ) : null}
      {!canRun(user) ? <Text style={s.muted}>Your account needs the homework grading permission to prepare references or run AI grading.</Text> : null}
    </Card>
  );
}

export function SubmissionAIGrading({ submission }) {
  const context = useContext(Context);
  const { user, pack } = context || {};
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const requestBusyRef = useRef(false);
  const selectionInitializedRef = useRef(false);
  const applyData = useCallback(data => {
    const nextFiles = data.files || [];
    setFiles(nextFiles);
    setCorrections(data.corrections || []);
    if (!selectionInitializedRef.current) {
      setFileIds(nextFiles.slice(0, 20).map(file => file.id));
      selectionInitializedRef.current = true;
    } else {
      setFileIds(current => current.filter(id => nextFiles.some(file => file.id === id)));
    }
    setSelectedId(current => (data.corrections || []).some(item => item.id === current)
      ? current : data.corrections?.[0]?.id || null);
  }, []);
  const load = useCallback(async () => {
    if (requestBusyRef.current) return;
    requestBusyRef.current = true;
    setLoading(true);
    try {
      const response = await api.get(`/ai-correction/submissions/${submission.id}`);
      applyData(response.data); setError("");
    } catch (requestError) { setError(errorText(requestError)); }
    finally { requestBusyRef.current = false; setLoading(false); }
  }, [submission.id, applyData]);
  const fileVersion = JSON.stringify((submission.files || []).map(file => [file.id, file.uploadedAt]));
  useEffect(() => { if (open) load(); }, [open, load, pack?.id, fileVersion]);
  const processing = corrections.some(item => item.status === "PROCESSING");
  useEffect(() => {
    if (!open || !processing) return;
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [open, processing, load]);
  if (!context || !isStaff(user)) return null;

  async function run() {
    setStarting(true); setError("");
    try {
      const response = await api.post(`/ai-correction/submissions/${submission.id}`, { fileIds });
      applyData(response.data);
      setSelectedId(response.data.correctionId);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setStarting(false); }
  }
  function toggle(id) {
    setFileIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  }
  const selected = corrections.find(item => item.id === selectedId);
  return (
    <View style={s.submissionPanel}>
      <Button title={open ? "Hide AI grading assistance" : "Open AI grading assistance"} variant="outline" onPress={() => setOpen(value => !value)} />
      {open ? (
        <View style={s.stack}>
          <Text style={s.label}>Private AI marking assistance</Text>
          <Text style={s.muted}>Suggestions are shared with authorized staff and saved for later. All selected PDFs and images are read together as one student answer, with one overall score. Nothing here is sent to the student. Review and annotate the original files, then use the normal grading form to return your final correction.</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={s.actions}>
            <Button title="Refresh saved corrections" variant="outline" loading={loading} onPress={load} />
          </View>
          {files.length ? (
            <View style={s.stack}>
              <Text style={s.label}>Student answer files: PDFs, JPG/JPEG and PNG (up to 20, 100 MB combined)</Text>
              {files.map(file => (
                <Pressable key={file.id} accessibilityRole="checkbox" accessibilityState={{ checked: fileIds.includes(file.id) }}
                  disabled={starting || processing} onPress={() => toggle(file.id)} style={s.fileOption}>
                  <Text style={s.body}>{fileIds.includes(file.id) ? "☑" : "☐"} {file.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : !loading ? <Text style={s.warning}>No supported PDFs or images are available. Office and text files are not yet supported by AI grading.</Text> : null}
          {!pack?.approvedAt || pack.status !== "READY" ? <Text style={s.warning}>Prepare and approve the task references above before running AI grading.</Text> : null}
          {canRun(user) ? (
            <Button title={processing ? "AI grading in progress…" : "Generate / open saved AI correction"} loading={starting}
              disabled={starting || processing || !pack?.approvedAt || pack?.status !== "READY" || !fileIds.length || fileIds.length > 20} onPress={run} />
          ) : null}
          {processing ? <Text style={s.muted}>Grading runs on the server. You may close this panel and reopen it later. An identical saved correction is reused without another AI call.</Text> : null}
          {corrections.length ? (
            <>
              <Text style={s.label}>Saved AI corrections</Text>
              <ScrollView horizontal contentContainerStyle={s.actions}>
                {corrections.map(item => (
                  <Button key={item.id} title={`${formatTime(item.createdAt)} • ${item.status}${item.stale ? " • outdated" : ""}`}
                    variant={selectedId === item.id ? "primary" : "outline"} onPress={() => setSelectedId(item.id)} />
                ))}
              </ScrollView>
            </>
          ) : null}
          {selected ? (
            <View style={s.stack}>
              <Text style={s.muted}>Requested by {selected.generatedByName} • {selected.model}</Text>
              <Text style={s.muted}>Answer files: {selected.inputFiles.map(file => file.name).join(", ")}</Text>
              {selected.stale ? <Text style={s.warning}>Outdated: the task references or submission files have changed since this correction. Generate a correction for the current inputs.</Text> : null}
              {selected.status === "FAILED" ? <Text style={s.error}>{selected.error} Select the same answer files and retry generation.</Text> : null}
              {selected.status === "PROCESSING" ? <ActivityIndicator color={colors.primary} /> : null}
              {selected.result ? <CorrectionView result={selected.result} /> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
function CorrectionView({ result }) {
  return (
    <View style={s.stack}>
      <Text style={s.title}>Suggested score: {result.totalAwarded} / {result.totalPossible} ({result.percentage}%)</Text>
      <Text style={s.warning}>AI suggestion only—not the student's published grade.</Text>
      <Text style={s.body}>{result.summary}</Text>
      {result.questionBreakdown.map(question => (
        <View key={question.question} style={s.question}>
          <Text style={s.label}>{question.question} • {question.awarded} / {question.possible}</Text>
          {question.needsTeacherReview ? <Text style={s.warning}>Needs human review</Text> : null}
          <Text style={s.label}>What the student wrote</Text>
          <Text style={s.body}>{question.studentAnswer}</Text>
          <Text style={s.muted}>{question.pageReferences.join("; ")}</Text>
          <List title="Marks earned for" values={question.awardedFor} />
          <List title="Marks deducted / missing for" values={question.deductedFor} />
          <Text style={s.body}>{question.feedback}</Text>
        </View>
      ))}
      <Text style={s.label}>Overall performance feedback</Text>
      <Text style={s.body}>{result.overallFeedback}</Text>
      <List title="Strengths" values={result.strengths} />
      <List title="Areas to improve" values={result.weaknesses} />
      <Text style={s.label}>Private staff notes</Text>
      <Text style={s.body}>{result.teacherNotes}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  referenceCard: { gap: spacing.sm, marginBottom: spacing.lg },
  submissionPanel: { gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  stack: { gap: spacing.sm, marginTop: spacing.sm },
  list: { gap: 4 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  title: { fontSize: 18, fontWeight: "800", color: colors.primary },
  label: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  body: { fontSize: 14, lineHeight: 21, color: colors.textPrimary },
  muted: { fontSize: 12, lineHeight: 18, color: colors.textMuted },
  error: { fontSize: 13, lineHeight: 20, color: colors.danger },
  warning: { fontSize: 13, lineHeight: 20, color: colors.warning },
  success: { fontSize: 13, color: colors.secondary },
  question: { gap: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background },
  fileOption: { padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
});

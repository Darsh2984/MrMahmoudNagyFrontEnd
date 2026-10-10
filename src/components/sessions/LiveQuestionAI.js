import React, { useCallback, useEffect, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import api from "../../lib/api";
import { getToken } from "../../lib/storage";
import { pickLiveFile, appendLiveFile } from "../../utils/liveAnswerUpload";
import { Button } from "../ui/Button";

const input = { borderWidth: 1, borderColor: "#B8CCC4", padding: 9, borderRadius: 6, marginVertical: 5, color: "#123E48" };
const errorText = error => error.response?.data?.msg || error.message || "Request failed.";

async function download(id, name) {
  const token = await getToken();
  const url = api.defaults.baseURL.replace(/\/$/, "") + "/live-questions/ai/corrections/" + id + "/pdf";
  const headers = { Authorization: "Bearer " + token, Accept: "application/pdf" };
  const fileName = String(name || "Student").replace(/[<>:"/\\|?*]/g, "-").slice(0, 90) + " - Live question - Corrected.pdf";
  if (Platform.OS === "web") {
    const response = await fetch(url, { headers });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.msg || "Export failed."); }
    const blob = await response.blob();
    if (!(await blob.slice(0, 5).text()).startsWith("%PDF-")) throw new Error("The server did not return a PDF. Check the backend deployment.");
    const link = document.createElement("a"), objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl; link.download = fileName;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } else {
    if (!FileSystem.cacheDirectory || !await Sharing.isAvailableAsync()) throw new Error("File sharing is unavailable.");
    const uri = FileSystem.cacheDirectory + Date.now() + "-" + fileName;
    const response = await FileSystem.downloadAsync(url, uri, { headers });
    if (response.status !== 200) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      throw new Error("PDF export failed. Refresh the correction and try again.");
    }
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
}

function Correction({ correction, answer, reload }) {
  const [draft, setDraft] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const saved = correction?.reviewedResult || correction?.result;
  async function run(fn) {
    setBusy(true); setError("");
    try { await fn(); await reload(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  function changeQuestion(index, key, value) {
    setDraft(old => ({ ...old, questionBreakdown: old.questionBreakdown.map((q, i) => i === index ? { ...q, [key]: value } : q) }));
  }
  return <View style={{ padding: 12, marginTop: 10, borderWidth: 1, borderColor: "#C7D9D1", borderRadius: 8 }}>
    <Text style={{ fontWeight: "bold" }}>{answer.student?.name || "Student"}</Text>
    {correction?.status === "PROCESSING" ? <Text>Correcting answer…</Text> :
      !saved ? <Button title={correction?.status === "FAILED" ? "Retry AI correction" : "Generate AI correction"}
        disabled={busy} onPress={() => run(() => api.post("/live-questions/answer/" + answer.id + "/ai"))} /> :
      <View>
        <Text>Suggested total: {saved.totalAwarded} / {saved.totalPossible}</Text>
        <Text>{saved.overallFeedback}</Text>
        <Button title="Review / edit correction" disabled={busy} onPress={() => setDraft(JSON.parse(JSON.stringify(saved)))} />
        {correction.confirmedAt && !draft ? <Button title="Download annotated PDF" disabled={busy}
          onPress={() => run(() => download(correction.id, answer.student?.name))} /> : null}
      </View>}
    {correction?.error ? <Text style={{ color: "#A32626" }}>{correction.error}</Text> : null}
    {draft ? <View>
      <Text>Check all marks and comments. Confirming enables export; use Save grade separately to publish the grade.</Text>
      {draft.questionBreakdown.map((q, i) => <View key={q.question} style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "bold" }}>{q.question} (maximum {q.possible})</Text>
        {q.needsTeacherReview ? <Text style={{ color: "#A15C00" }}>Review needed: verify the answer and marking criteria.</Text> : null}
        <Text>Student answer</Text>
        <TextInput multiline style={input} value={q.studentAnswer} onChangeText={v => changeQuestion(i, "studentAnswer", v)} />
        <Text>Awarded marks</Text>
        <TextInput style={input} keyboardType="decimal-pad" value={String(q.awarded)} onChangeText={v => changeQuestion(i, "awarded", v)} />
        <Text>Marks earned (one point per line)</Text>
        <TextInput multiline style={input} value={q.awardedFor.join("\n")} onChangeText={v => changeQuestion(i, "awardedFor", v.split("\n"))} />
        <Text>Marks deducted (one point per line)</Text>
        <TextInput multiline style={input} value={q.deductedFor.join("\n")} onChangeText={v => changeQuestion(i, "deductedFor", v.split("\n"))} />
        <Text>Feedback</Text>
        <TextInput multiline style={input} value={q.feedback} onChangeText={v => changeQuestion(i, "feedback", v)} />
      </View>)}
      <Text>Summary</Text>
      <TextInput multiline style={input} value={draft.summary} onChangeText={summary => setDraft(old => ({ ...old, summary }))} />
      <Text>Overall feedback</Text>
      <TextInput multiline style={input} value={draft.overallFeedback} onChangeText={overallFeedback => setDraft(old => ({ ...old, overallFeedback }))} />
      <Button title="Confirm correction" disabled={busy} onPress={() => run(async () => {
        const result = { ...draft, questionBreakdown: draft.questionBreakdown.map(q => {
          if (String(q.awarded).trim() === "") throw new Error("Enter a grade for every question.");
          return { ...q, awarded: Number(q.awarded) };
        }) };
        await api.post("/live-questions/ai/corrections/" + correction.id + "/confirm", { result });
        setDraft(null);
      })} />
      <Button title="Cancel editing" variant="outline" disabled={busy} onPress={() => setDraft(null)} />
    </View> : null}
    {error ? <Text style={{ color: "#A32626" }}>{error}</Text> : null}
  </View>;
}

export default function LiveQuestionAI({ question, answers }) {
  const [data, setData] = useState({ pack: null, corrections: [] });
  const [paper, setPaper] = useState(null), [scheme, setScheme] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [showRubric, setShowRubric] = useState(false);
  const reload = useCallback(async () => {
    const response = await api.get("/live-questions/" + question.id + "/ai");
    setData(response.data);
  }, [question.id]);
  useEffect(() => {
    let active = true;
    const load = async () => { try { if (active) await reload(); } catch (e) { if (active) setError(errorText(e)); } };
    load();
    const timer = setInterval(load, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [reload]);
  async function run(fn) {
    setBusy(true); setError("");
    try { await fn(); await reload(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  const pack = data.pack;
  return <View style={{ padding: 12, backgroundColor: "#F0F5F3", borderRadius: 10 }}>
    <Text style={{ fontWeight: "bold", fontSize: 17 }}>Written answer AI correction</Text>
    <Text>Upload references once for this live question. All assigned teaching staff can reuse them.</Text>
    <Button title={paper?.name || "Select question paper PDF"} disabled={busy} variant="outline" onPress={() => run(async () => {
      const file = await pickLiveFile(); if (file) setPaper(file);
    })} />
    <Button title={scheme?.name || "Select mark scheme PDF"} disabled={busy} variant="outline" onPress={() => run(async () => {
      const file = await pickLiveFile(); if (file) setScheme(file);
    })} />
    <Button title="Analyze references" disabled={busy || !paper || !scheme || pack?.status === "PROCESSING"}
      onPress={() => run(async () => {
        const form = new FormData();
        await appendLiveFile(form, "questionPaper", paper); await appendLiveFile(form, "markScheme", scheme);
        await api.post("/live-questions/" + question.id + "/ai/references", form, { timeout: 300000 });
        setPaper(null); setScheme(null);
      })} />
    {pack ? <Text>References: {pack.questionName} / {pack.schemeName} — {pack.status}{pack.approved ? " (approved)" : ""}</Text> : null}
    {pack?.error ? <Text style={{ color: "#A32626" }}>{pack.error}</Text> : null}
    {pack?.rubric ? <View>
      <Button title={showRubric ? "Hide marking criteria" : "Review marking criteria"} variant="outline" onPress={() => setShowRubric(!showRubric)} />
      {showRubric ? <View>
        <Text>Total reference marks: {pack.rubric.totalPossible}; live question: {question.gradeOutOf}</Text>
        {pack.rubric.documentWarnings.map((warning, i) => <Text key={i}>{warning}</Text>)}
        {pack.rubric.questions.map(q => <View key={q.question} style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: "bold" }}>{q.question} — {q.possible} marks</Text>
          <Text>{q.questionText}</Text><Text>{q.markingPoints.join("\n")}</Text>
          <Text>{q.acceptedAnswers.join("\n")}</Text><Text>{q.uncertainties.join("\n")}</Text>
        </View>)}
        {!pack.approved ? <Button title="Approve reviewed references" disabled={busy}
          onPress={() => run(() => api.post("/live-questions/" + question.id + "/ai/approve", { packId: pack.id }))} /> : null}
      </View> : null}
    </View> : null}
    {pack?.approved ? answers.map(answer => <Correction key={answer.id + pack.id} answer={answer}
      correction={data.corrections.find(c => c.answerId === answer.id)} reload={reload} />) : null}
    {error ? <Text style={{ color: "#A32626" }}>{error}</Text> : null}
  </View>;
}

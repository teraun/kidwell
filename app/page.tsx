"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Loader2,
  Sparkles,
  TrendingDown,
  Users,
  Salad,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "student" | "parent" | "counsellor";
type User = {
  id: number;
  username: string;
  role: Role;
  full_name: string;
  age: number | null;
};

function scoreBadge(score: number | null) {
  if (score == null) return <Badge variant="outline">—</Badge>;
  if (score < 50) return <Badge variant="danger">{Math.round(score)}</Badge>;
  if (score < 75) return <Badge variant="warning">{Math.round(score)}</Badge>;
  return <Badge variant="success">{Math.round(score)}</Badge>;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("");

  async function refreshUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    if (data.user) {
      const defaults: Record<Role, string> = {
        student: "checkin",
        parent: "overview",
        counsellor: "students",
      };
      setActiveTab(defaults[data.user.role as Role]);
    }
    setLoadingAuth(false);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <LoginView onLoggedIn={refreshUser} />;

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {user.role === "student" && (
        <>
          {activeTab === "checkin" && <StudentCheckin user={user} />}
          {activeTab === "nutrition" && <StudentNutrition />}
        </>
      )}
      {user.role === "parent" && <ParentOverview />}
      {user.role === "counsellor" && (
        <CounsellorDashboard activeTab={activeTab} />
      )}
    </DashboardLayout>
  );
}

/* ─────────────── LOGIN ─────────────── */

function LoginView({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const demos = [
    { u: "sara", label: "Student", desc: "Sara — age 10" },
    { u: "parent", label: "Parent", desc: "Mrs. Alemu" },
    { u: "counsellor", label: "Counsellor", desc: "Mr. Bekele" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Heart className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">KidWell</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Supporting student wellbeing, together.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            AI-powered check-ins, nutrition plans, and counsellor briefs — so
            every child gets the support they need, early.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Wellness Hackathon 2026 · Heal. Build. Thrive.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">KidWell</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div>
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Demo accounts — click to fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demos.map((d) => (
                <button
                  key={d.u}
                  onClick={() => {
                    setUsername(d.u);
                    setPassword(d.u);
                  }}
                  className="rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <p className="text-xs font-semibold text-primary">{d.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── STUDENT: CHECK-IN ─────────────── */

function StudentCheckin({ user }: { user: User }) {
  const [mood, setMood] = useState("3");
  const [energy, setEnergy] = useState("3");
  const [sleepHours, setSleepHours] = useState("7");
  const [painAreas, setPainAreas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    wellbeing_score: number;
    summary: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: Number(mood),
          energy: Number(energy),
          sleepHours: Number(sleepHours),
          painAreas: painAreas
            ? painAreas.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const moodLabels = ["", "Very low", "Low", "Okay", "Good", "Great"];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Hi, {user.full_name} 👋</h2>
        <p className="text-muted-foreground">
          How are you feeling today? This only takes 30 seconds.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Daily Check-in
          </CardTitle>
          <CardDescription>
            Your answers help your counsellor support you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Mood (1–5)</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} — {moodLabels[n]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Energy (1–5)</Label>
                <Select value={energy} onValueChange={setEnergy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sleep (hours)</Label>
                <Input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Any aches? (optional)</Label>
              <Input
                value={painAreas}
                onChange={(e) => setPainAreas(e.target.value)}
                placeholder="e.g. head, stomach"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Computing score…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit Check-in
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-6 pt-6">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary bg-background">
              <span className="text-3xl font-bold text-primary">
                {Math.round(result.wellbeing_score)}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Your wellbeing score
              </p>
              <Progress value={result.wellbeing_score} className="my-2 h-2" />
              <p className="text-base italic text-foreground">
                &ldquo;{result.summary}&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─────────────── STUDENT: NUTRITION ─────────────── */

function StudentNutrition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    days: { day: string; breakfast: string; lunch: string; dinner: string }[];
    rationale: string;
  } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/nutrition", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Nutrition Plan</h2>
        <p className="text-muted-foreground">
          A healthy meal plan built around local Ethiopian foods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Salad className="h-5 w-5 text-primary" />
            Weekly Meal Plan
          </CardTitle>
          <CardDescription>
            AI-generated plan based on your profile — age 10, Ethiopian diet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating plan…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate This Week&apos;s Plan
              </>
            )}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 sm:grid-cols-3">
          {result.days?.map((day) => (
            <Card key={day.day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-primary">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Breakfast</span>
                  <p>{day.breakfast}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Lunch</span>
                  <p>{day.lunch}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Dinner</span>
                  <p>{day.dinner}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result?.rationale && (
        <Alert>
          <Salad className="h-4 w-4" />
          <AlertTitle>Why this plan</AlertTitle>
          <AlertDescription>{result.rationale}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/* ─────────────── PARENT ─────────────── */

function ParentOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.child) {
    return (
      <Alert>
        <AlertDescription>No child linked to this account.</AlertDescription>
      </Alert>
    );
  }

  const latest = data.checkins?.[0];
  const avgScore =
    data.checkins?.length > 0
      ? data.checkins.reduce(
          (s: number, c: any) => s + (c.wellbeing_score || 0),
          0
        ) / data.checkins.length
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{data.child.full_name}&apos;s Wellbeing</h2>
        <p className="text-muted-foreground">Age {data.child.age} · Parent dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Score</CardDescription>
            <CardTitle className="text-3xl">
              {latest?.wellbeing_score ? Math.round(latest.wellbeing_score) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latest && <Progress value={latest.wellbeing_score} className="h-2" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">
              {avgScore ? Math.round(avgScore) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {data.checkins.length} check-ins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Check-ins</CardDescription>
            <CardTitle className="text-3xl">{data.checkins.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recorded so far</p>
          </CardContent>
        </Card>
      </div>

      {latest?.summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Latest AI summary</p>
            <p className="mt-1 text-lg italic">&ldquo;{latest.summary}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead>Energy</TableHead>
                <TableHead>Sleep</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.checkins.map((c: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{c.mood}</TableCell>
                  <TableCell>{c.energy}</TableCell>
                  <TableCell>{c.sleep_hours}h</TableCell>
                  <TableCell>{scoreBadge(c.wellbeing_score)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── COUNSELLOR ─────────────── */

function CounsellorDashboard({ activeTab }: { activeTab: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState<any>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => setStudents(d.students || []));
  }, []);

  async function generateBrief(studentId: number) {
    setSelected(studentId);
    setLoading(true);
    setError("");
    setBrief(null);
    try {
      const res = await fetch("/api/counsellor-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBrief(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const needsAttention = students.filter(
    (s) => s.latest_score != null && s.latest_score < 50
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Counsellor Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor student wellbeing and generate AI briefs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Students</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Needs Attention</CardDescription>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {needsAttention}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>With Check-ins</CardDescription>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.filter((s) => s.latest_score != null).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab === "briefs" ? "briefs" : "students"}>
        <TabsList>
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="briefs">AI Brief</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Click &ldquo;Generate Brief&rdquo; to get an AI summary for a
                supportive check-in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Latest Score</TableHead>
                    <TableHead>Last Check-in</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow
                      key={s.id}
                      className={selected === s.id ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.age}</TableCell>
                      <TableCell>{scoreBadge(s.latest_score)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.latest_checkin
                          ? new Date(s.latest_checkin).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateBrief(s.id)}
                          disabled={loading && selected === s.id}
                        >
                          {loading && selected === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="mr-1 h-3 w-3" />
                              Brief
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs">
          {loading && (
            <Card>
              <CardContent className="flex items-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground">
                  AI is preparing the counsellor brief…
                </span>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !brief && !error && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a student and click &ldquo;Generate Brief&rdquo; to see
                the AI summary here.
              </CardContent>
            </Card>
          )}

          {brief && (
            <div className="space-y-4">
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not a diagnostic tool</AlertTitle>
                <AlertDescription>
                  This brief is for supportive human follow-up only. The
                  counsellor always decides.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Brief for {brief.student}</CardTitle>
                  <CardDescription>AI-generated pattern summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                      Summary
                    </h4>
                    <p className="text-foreground">{brief.summary}</p>
                  </div>

                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                      <AlertTriangle className="h-4 w-4" />
                      Key Concerns
                    </h4>
                    <ul className="space-y-1">
                      {brief.concerns?.map((c: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-sm"
                        >
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                      <MessageCircle className="h-4 w-4" />
                      Conversation Starters
                    </h4>
                    <ul className="space-y-1">
                      {brief.conversation_starters?.map((s: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm"
                        >
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

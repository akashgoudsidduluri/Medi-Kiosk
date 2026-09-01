import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getAiProviderStatus } from "@/services/ai/GroqAiInterviewService";
import {
  Activity,
  ArrowRight,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const overviewCards = [
  {
    label: "Today's OPD",
    value: "38",
    detail: "+6 from yesterday",
    icon: Users,
  },
  {
    label: "Urgent flag",
    value: "5",
    detail: "2 need immediate review",
    icon: Bell,
  },
  {
    label: "Case sheets",
    value: "24",
    detail: "12 awaiting review",
    icon: FileText,
  },
  {
    label: "AI triage",
    value: "92%",
    detail: "confidence snapshot",
    icon: Activity,
  },
];

const queueItems = [
  { name: "Ravi Kumar", complaint: "Abdominal discomfort", priority: "Urgent", time: "08 min" },
  { name: "Asha Nair", complaint: "Fever with chills", priority: "Priority", time: "12 min" },
  { name: "Suresh Rao", complaint: "Knee pain", priority: "Routine", time: "19 min" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const providerStatus = getAiProviderStatus();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Authenticated workspace
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome{user?.name ? `, ${user.name}` : " back"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
              <Stethoscope className="size-4 text-primary" />
              OPD Mode Active
            </div>
            <div className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              AI: {providerStatus}
            </div>
            <Button type="button" variant="outline" className="cursor-pointer gap-2" onClick={handleSignOut}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </motion.header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ label, value, detail, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="h-full border-border/70 shadow-none">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LayoutDashboard className="size-4 text-primary" />
                    Patient queue
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs">
                    Review all
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {queueItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.complaint}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          item.priority === "Urgent"
                            ? "bg-red-500/10 text-red-600"
                            : item.priority === "Priority"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Clinical summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Priority</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">Urgent</p>
                  <p className="mt-1">2 cases flagged with red-flag symptoms or elevated risk.</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AI assistant</p>
                  <p className="mt-2 font-medium text-foreground">Pre-consultation intelligence is active.</p>
                  <p className="mt-1">Document OCR, AYUSH assessment, and triage guidance are available.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

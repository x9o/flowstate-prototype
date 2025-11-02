import { MoreHorizontal } from "lucide-react";
import { Switch } from "./ui/switch";

interface TaskCardProps {
  title: string;
  tag: string;
  tagColor: "mint" | "indigo" | "peach" | "sky" | "lavender";
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const tagColors = {
  mint: "bg-mint/10 text-mint",
  indigo: "bg-indigo/10 text-indigo",
  peach: "bg-peach/20 text-peach",
  sky: "bg-sky/10 text-sky",
  lavender: "bg-lavender/15 text-lavender",
};

const taskBgColors = {
  mint: "bg-mint/5 hover:bg-mint/8",
  indigo: "bg-indigo/5 hover:bg-indigo/8",
  peach: "bg-peach/8 hover:bg-peach/12",
  sky: "bg-sky/5 hover:bg-sky/8",
  lavender: "bg-lavender/8 hover:bg-lavender/12",
};

export const TaskCard = ({ title, tag, tagColor, enabled = true, onToggle }: TaskCardProps) => {
  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-150 ${
        taskBgColors[tagColor]
      } ${enabled ? "" : "opacity-50"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wide ${tagColors[tagColor]}`}
          >
            {tag}
          </span>
          <p className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>
            {title}
          </p>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Switch checked={enabled} onCheckedChange={onToggle} className="scale-75" />
          <button className="p-1 hover:bg-background/50 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

import { MoreHorizontal } from "lucide-react";
import { Switch } from "./ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TaskCardProps {
  title: string;
  tag: string;
  tagColor: "mint" | "indigo" | "peach" | "sky" | "lavender";
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  onDelete?: () => void;
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

export const TaskCard = ({ title, tag, tagColor, enabled = true, onToggle, onDelete }: TaskCardProps) => {
  return (
    <div
      className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-150 ${
        taskBgColors[tagColor]
      } ${enabled ? "" : "opacity-50"}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <span
            className={`inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium uppercase tracking-wide ${tagColors[tagColor]}`}
          >
            {tag}
          </span>
          <p className={`text-xs sm:text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground line-through"} break-words`}>
            {title}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <Switch checked={enabled} onCheckedChange={onToggle} className="scale-75 sm:scale-100" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-background/50 rounded-lg transition-colors">
                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border shadow-lg z-50" sideOffset={5}>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg"
              >
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

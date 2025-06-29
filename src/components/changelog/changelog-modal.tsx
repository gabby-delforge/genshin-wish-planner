"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ChangelogEntry } from "@/lib/changelog/changelog-data";
import { markCurrentVersionAsSeen } from "@/lib/changelog/changelog-utils";
import { observer } from "mobx-react-lite";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
}

const ChangeTypeColors = {
  feature: "bg-green-500/20 text-green-300 border-green-500/40",
  improvement: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  fix: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  breaking: "bg-red-500/20 text-red-300 border-red-500/40",
  content: "bg-purple-500/20 text-purple-300 border-purple-500/40",
} as const;

const ChangeTypeLabels = {
  feature: "New",
  improvement: "Improved",
  fix: "Fixed",
  breaking: "Breaking",
  content: "Content",
} as const;

export const ChangelogModal = observer(function ChangelogModal({
  isOpen,
  onClose,
  changelog,
}: ChangelogModalProps) {
  const handleClose = () => {
    markCurrentVersionAsSeen();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{`What's New`}</span>
            {changelog.length > 0 && (
              <Badge className="bg-gold-1/20 text-gold-1 border-gold-1/40">
                {changelog.length} update{changelog.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
          <Separator className="bg-void-2/50" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {changelog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {`You're all caught up! No new changes to show.`}
            </div>
          ) : (
            changelog.map((entry) => (
              <div key={entry.version} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gold-1">{entry.date}</span>
                  <span className="text-sm text-white/50">
                    v{entry.version}
                  </span>
                </div>

                <div className="space-y-2 pl-4">
                  {entry.changes.map((change, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge
                        variant="outline"
                        className={`${
                          ChangeTypeColors[change.type]
                        } text-xs shrink-0 mt-0.5`}
                      >
                        {ChangeTypeLabels[change.type]}
                      </Badge>
                      <p className="text-sm leading-relaxed mt-0.5">
                        {change.description}
                      </p>
                    </div>
                  ))}
                </div>

                {entry !== changelog[changelog.length - 1] && (
                  <Separator className="bg-void-2/30 mt-4" />
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { Button } from './button';

export type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Dialog({ open, title, children, onClose, footer }: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fpm-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="fpm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="fpm-dialog__title">
          {title}
        </h2>
        <div className="fpm-dialog__body">{children}</div>
        {footer ? <div className="fpm-dialog__actions">{footer}</div> : null}
      </div>
    </div>
  );
}

export type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  pendingLabel = 'Working…',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const isPending = pending || busy;

  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  return (
    <Dialog
      open={open}
      title={title}
      onClose={isPending ? () => undefined : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            disabled={isPending}
            onClick={() => {
              setBusy(true);
              startTransition(() => {
                void Promise.resolve(onConfirm()).finally(() => setBusy(false));
              });
            }}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      {description}
    </Dialog>
  );
}

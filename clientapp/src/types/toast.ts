
export type ToastType =
    | 'toast-default'
    | 'toast-save'
    | 'toast-add'
    | 'toast-delete'
    | 'toast-timer'
    | 'toast-reset';

export interface Toast {
    id: number;
    message: string;
    emoji: string;
    type: ToastType;
    exiting: boolean;
    action?: ToastAction;
    durationMs?: number;
}
export interface ToastAction {
    label: string;
    handler: () => void;
}
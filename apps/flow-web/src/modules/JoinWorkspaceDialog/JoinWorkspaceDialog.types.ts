export interface StudentInfo {
  readonly name: string
  readonly identificationNumber: string
}

export interface JoinWorkspaceDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly student: StudentInfo | null
}

import { nanoid } from 'nanoid'

export function createCredentialId() {
  return nanoid(16)
}

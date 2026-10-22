const BASELINE = '20260724000000_initial_schema';
const LEGACY_RESET = '20261008230000_add_client_password_reset';
const RESET = '20261008230100_add_client_password_reset';

/** Read-only policy: retain legacy records and require verified replacement markers. */
export function migrationHistoryBlockers({ hasUsers, history, resetChecksums }) {
  const checksums = new Set(resetChecksums);
  const active = history.filter(row => !row.rolled_back_at);
  const completed = name => active.filter(row => row.migration_name === name && row.finished_at);
  const blockers = [];
  if (hasUsers && completed(BASELINE).length === 0) {
    blockers.push('Existing core schema needs baseline verification/adoption; see RELEASE-READINESS.md.');
  }
  const legacy = active.filter(row => row.migration_name === LEGACY_RESET);
  if (legacy.length && (
    !legacy.every(row => row.finished_at && checksums.has(row.checksum)) ||
    !completed(RESET).some(row => checksums.has(row.checksum))
  )) {
    blockers.push('Legacy reset history needs a verified replacement marker; keep its original record and checksum. See RELEASE-READINESS.md.');
  }
  if (active.some(row => !row.finished_at)) {
    blockers.push('Unresolved failed migration records must be investigated.');
  }
  return blockers;
}

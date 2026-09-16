import Link from 'next/link';
import {
  Badge,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { SoftFilterForm } from '@/components/soft-filter-form';
import { listAccountsAction, listFirmOptionsAction } from '@/server/actions/accounts';
import { accountDisplayName } from '@/server/services/accounts';

function phaseTone(phase: string) {
  if (phase === 'ACTIVE') return 'success' as const;
  if (phase === 'PAUSED') return 'warning' as const;
  return 'neutral' as const;
}

function formatSize(size: string, currency: string) {
  return `${size} ${currency}`;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; firmId?: string; phase?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1') || 1;
  const [result, firmsResult] = await Promise.all([
    listAccountsAction({
      search: params.q,
      firmId: params.firmId || undefined,
      phase: params.phase || undefined,
      page,
      pageSize: 20,
    }),
    listFirmOptionsAction(),
  ]);

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Funded Accounts" description="Challenge and funded accounts." />
        <EmptyState title="Unable to load accounts" description={result.error.message} />
      </>
    );
  }

  const firms = firmsResult.ok ? firmsResult.options : [];
  const { items, total } = result;

  return (
    <>
      <PageHeader
        title="Funded Accounts"
        description="Challenge and funded accounts under prop firms."
        actions={
          <Link href="/accounts/new" className="fpm-btn fpm-btn--primary">
            + Add Account
          </Link>
        }
      />

      <SoftFilterForm
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <SearchInput
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search accounts or firms…"
          />
        </div>
        <Select name="firmId" defaultValue={params.firmId ?? ''} style={{ maxWidth: 200 }}>
          <option value="">All firms</option>
          {firms.map((firm) => (
            <option key={firm.id} value={firm.id}>
              {firm.name}
            </option>
          ))}
        </Select>
        <Select name="phase" defaultValue={params.phase ?? ''} style={{ maxWidth: 160 }}>
          <option value="">All phases</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
        </Select>
        <span style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>
          {total} account{total === 1 ? '' : 's'}
        </span>
      </SoftFilterForm>

      {items.length === 0 ? (
        <EmptyState
          title="No funded accounts yet"
          description="Create a firm first, then add a funded account."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Account</TH>
              <TH>Firm</TH>
              <TH>Phase</TH>
              <TH>Size</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((account) => (
              <TR key={account.id}>
                <TD>
                  <Link
                    href={`/accounts/${account.id}`}
                    style={{ fontWeight: 600, color: 'inherit' }}
                  >
                    {accountDisplayName(account)}
                  </Link>
                  {account.accountNumber ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--fpm-text-muted)',
                        fontFamily: 'ui-monospace, monospace',
                      }}
                    >
                      #{account.accountNumber}
                    </div>
                  ) : null}
                </TD>
                <TD>{account.firmName}</TD>
                <TD>
                  <Badge tone={phaseTone(account.phase)}>{account.phase}</Badge>
                </TD>
                <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatSize(account.currentSize, account.currency)}
                </TD>
                <TD>
                  <Link href={`/accounts/${account.id}/edit`}>Edit</Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}

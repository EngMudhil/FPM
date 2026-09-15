import { EmptyState, PageHeader } from '@fpm/ui';

type Props = {
  title: string;
  description: string;
  task: string;
};

export default function ModulePlaceholder({ title, description, task }: Props) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} coming soon`}
        description={`This route is reserved by the Spec navigation. Implementation lands in ${task}.`}
      />
    </>
  );
}

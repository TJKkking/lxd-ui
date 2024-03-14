import { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import Loader from "components/Loader";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { isoTimeToString } from "util/helpers";
import { LxdOperationStatus } from "types/operation";
import OperationInstanceName from "pages/operations/OperationInstanceName";
import NotificationRow from "components/NotificationRow";
import { getProjectName } from "util/operations";
import { useOperations } from "context/operationsProvider";
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

const OperationList: FC = () => {
  const notify = useNotify();
  const { operations, isLoading, error } = useOperations();

  if (error) {
    notify.failure(t("loading-operations-failed"), error);
  }

  const headers = [
    { content: t("time"), className: "time", sortKey: "created_at" },
    { content: t("action"), className: "action", sortKey: "action" },
    { content: t("info"), className: "info" },
    { content: t("status"), className: "status", sortKey: "status" },
    { "aria-label": t("actions"), className: "cancel u-align--right" },
  ];

  const getIconNameForStatus = (status: LxdOperationStatus) => {
    return {
      Cancelled: "status-failed-small",
      Failure: "status-failed-small",
      Running: "status-in-progress-small",
      Success: "status-succeeded-small",
    }[status];
  };

  const rows = operations.map((operation) => {
    const projectName = getProjectName(operation);
    return {
      columns: [
        {
          content: (
            <>
              <div>Initiated: {isoTimeToString(operation.created_at)}</div>
              <div className="u-text--muted">
                t('last-update') {isoTimeToString(operation.updated_at)}
              </div>
            </>
          ),
          role: "rowheader",
          "aria-label": t("time"),
          className: "time",
        },
        {
          content: (
            <>
              <div>{operation.description}</div>
              <div className="u-truncate u-text--muted">
                <OperationInstanceName operation={operation} />
              </div>
              <div className="u-text--muted u-truncate" title={projectName}>
                Project: {projectName}
              </div>
            </>
          ),
          role: "rowheader",
          "aria-label": t("action"),
          className: "action",
        },
        {
          content: (
            <>
              <div>{operation.err}</div>
              {Object.entries(operation.metadata ?? {}).map(
                ([key, value], index) => (
                  <span key={index} title={JSON.stringify(value)}>
                    {key}: {JSON.stringify(value)}
                  </span>
                ),
              )}
            </>
          ),
          role: "rowheader",
          "aria-label": t("info"),
          className: "info",
        },
        {
          content: (
            <>
              <Icon
                name={getIconNameForStatus(operation.status)}
                className="status-icon"
              />
              {operation.status}
            </>
          ),
          role: "rowheader",
          "aria-label": t("status"),
          className: "status",
        },
        {
          content: <CancelOperationBtn operation={operation} />,
          role: "rowheader",
          className: "u-align--right cancel",
          "aria-label": t("actions"),
        },
      ],
      sortData: {
        created_at: operation.created_at,
        action: operation.description,
        status: operation.status,
      },
    };
  });

  return (
    <>
      <BaseLayout title={t("ongoing-operations")}>
        <NotificationRow />
        <Row>
          {operations.length > 0 && (
            <MainTable
              headers={headers}
              rows={rows}
              paginate={30}
              responsive
              sortable
              className="operation-list"
              emptyStateMsg={
                isLoading ? (
                  <Loader text={t("loading-operations")} />
                ) : (
                  t("no-data-to-display")
                )
              }
            />
          )}
          {!isLoading && operations.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="status" className="empty-state-icon" />}
              title={t("no-operations-found")}
            >
              <p>{t("there-are-no-ongoing-operations")}</p>
            </EmptyState>
          )}
        </Row>
      </BaseLayout>
    </>
  );
};

export default OperationList;

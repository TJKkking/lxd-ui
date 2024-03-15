import { FC } from "react";
import { MainTable, Row, useNotify } from "@canonical/react-components";
import { fetchWarnings } from "api/warnings";
import { isoTimeToString } from "util/helpers";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import { useTranslation } from "react-i18next";

const WarningList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();

  const { t } = useTranslation();

  const {
    data: warnings = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.warnings],
    queryFn: fetchWarnings,
  });

  if (error) {
    notify.failure(t("loading-warnings-failed"), error);
  }

  const headers = [
    { content: t("type"), sortKey: "type" },
    { content: t("last-message"), sortKey: "lastMessage" },
    { content: t("status"), sortKey: "status" },
    { content: t("severity"), sortKey: "severity" },
    { content: t("count"), sortKey: "count", className: "u-align--right" },
    { content: t("project"), sortKey: "project" },
    { content: t("first-seen"), sortKey: "firstSeen" },
    { content: t("last-seen"), sortKey: "lastSeen" },
  ];

  const rows = warnings.map((warning) => {
    return {
      columns: [
        {
          content: warning.type,
          role: "rowheader",
          "aria-label": t("type"),
        },
        {
          content: warning.last_message,
          role: "rowheader",
          "aria-label": t("last-message"),
        },
        {
          content: warning.status,
          role: "rowheader",
          "aria-label": t("status"),
        },
        {
          content: warning.severity,
          role: "rowheader",
          "aria-label": t("severity"),
        },
        {
          content: warning.count,
          role: "rowheader",
          className: "u-align--right",
          "aria-label": t("count"),
        },
        {
          content: warning.project,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": t("project"),
        },
        {
          content: isoTimeToString(warning.first_seen_at),
          role: "rowheader",
          "aria-label": t("first-seen"),
        },
        {
          content: isoTimeToString(warning.last_seen_at),
          role: "rowheader",
          "aria-label": t("last-seen"),
        },
      ],
      sortData: {
        type: warning.type,
        lastMessage: warning.last_message.toLowerCase(),
        status: warning.status,
        severity: warning.severity,
        count: warning.count,
        project: warning.project.toLowerCase(),
        firstSeen: warning.first_seen_at,
        lastSeen: warning.last_seen_at,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title={
          <HelpLink
            href={`${docBaseLink}/howto/troubleshoot/`}
            title={t("learn-more-about-troubleshooting")}
          >
            {t("warnings")}
          </HelpLink>
        }
      >
        <NotificationRow />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg={
              isLoading ? (
                <Loader text={t("loading-warnings")} />
              ) : (
                t("no-data-to-display")
              )
            }
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default WarningList;

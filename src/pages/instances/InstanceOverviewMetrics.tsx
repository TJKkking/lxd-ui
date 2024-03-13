import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { humanFileSize } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { useAuth } from "context/auth";
import { useTranslation } from "react-i18next";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewMetrics: FC<Props> = ({ instance, onFailure }) => {
  const { isRestricted } = useAuth();

  const { t } = useTranslation();

  const {
    data: metrics = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: fetchMetrics,
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });

  if (error) {
    onFailure(t("loading-metrics-failed"), error);
  }

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  if (isRestricted) {
    return (
      <div className="u-text--muted">
        {t("details-are-not-available-for-restricted-users")}
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Loader text={t("loading-metrics")} />
      ) : (
        <table>
          <tbody>
            <tr className="metric-row">
              <th className="p-muted-heading">{t("memory")}</th>
              <td>
                {instanceMetrics.memory ? (
                  <div>
                    <Meter
                      percentage={
                        (100 / instanceMetrics.memory.total) *
                        (instanceMetrics.memory.total -
                          instanceMetrics.memory.free)
                      }
                      text={
                        humanFileSize(
                          instanceMetrics.memory.total -
                            instanceMetrics.memory.free,
                        ) +
                        " of " +
                        humanFileSize(instanceMetrics.memory.total) +
                        "{t('memory-used')}"
                      }
                    />
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr className="metric-row">
              <th className="p-muted-heading">{t("disk")}</th>
              <td>
                {instanceMetrics.disk ? (
                  <div>
                    <Meter
                      percentage={
                        (100 / instanceMetrics.disk.total) *
                        (instanceMetrics.disk.total - instanceMetrics.disk.free)
                      }
                      text={
                        humanFileSize(
                          instanceMetrics.disk.total -
                            instanceMetrics.disk.free,
                        ) +
                        " of " +
                        humanFileSize(instanceMetrics.disk.total) +
                        " {t('disk-used')}"
                      }
                    />
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

export default InstanceOverviewMetrics;

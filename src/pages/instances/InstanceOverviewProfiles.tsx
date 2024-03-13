import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";
import { fetchProfiles } from "api/profiles";
import { useTranslation } from "react-i18next";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewProfiles: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: profiles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, instance.project],
    queryFn: () => fetchProfiles(instance.project),
  });

  const { t } = useTranslation();

  if (error) {
    onFailure(t("loading-profiles-failed"), error);
  }

  const profileHeaders = [
    { content: t("name"), sortKey: "name", className: "p-muted-heading" },
    {
      content: t("description"),
      sortKey: "description",
      className: "p-muted-heading",
    },
  ];

  const profileRows = instance.profiles.map((profile) => {
    if (profiles.length < 1) {
      return {
        columns: undefined,
      };
    }
    const description = profiles.filter((item) => item.name === profile)[0]
      .description;
    return {
      columns: [
        {
          content: (
            <Link
              to={`/ui/project/${instance.project}/profile/${profile}`}
              title={t("profileName", { name: profile })}
            >
              {profile}
            </Link>
          ),
          role: "rowheader",
          "aria-label": t("name"),
        },
        {
          content: description,
          role: "rowheader",
          title: `${t("description")} ${description}`,
          "aria-label": t("description"),
        },
      ],
      sortData: {
        name: profile.toLowerCase(),
        description: description.toLowerCase(),
      },
    };
  });

  return (
    <>
      {isLoading ? (
        <Loader text={t("loading-profiles")} />
      ) : (
        <MainTable headers={profileHeaders} rows={profileRows} sortable />
      )}
    </>
  );
};

export default InstanceOverviewProfiles;

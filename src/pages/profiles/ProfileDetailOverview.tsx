import { FC, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Notification, Row } from "@canonical/react-components";
import { LxdProfile } from "types/profile";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import ProfileInstances from "./ProfileInstances";
import ItemName from "components/ItemName";
import classnames from "classnames";
import { CLOUD_INIT } from "./forms/ProfileFormMenu";
import { slugify } from "util/slugify";
import { getProfileInstances } from "util/usedBy";
import ProfileNetworkList from "./ProfileNetworkList";
import ProfileStorageList from "./ProfileStorageList";
import { useTranslation } from "react-i18next";

interface Props {
  profile: LxdProfile;
  featuresProfiles: boolean;
}

const ProfileDetailOverview: FC<Props> = ({ profile, featuresProfiles }) => {
  const { project } = useParams<{ project: string }>();

  const { t } = useTranslation();

  if (!project) {
    return <>{t("missing-project")}</>;
  }

  const updateContentHeight = () => {
    updateMaxHeight("profile-overview-tab");
  };
  useEffect(updateContentHeight, []);
  useEventListener("resize", updateContentHeight);

  const hasCloudInit =
    profile.config["cloud-init.user-data"] ||
    profile.config["cloud-init.vendor-data"] ||
    profile.config["cloud-init.network-config"];

  const isDefaultProject = project === "default";
  const usageCount = getProfileInstances(
    project,
    isDefaultProject,
    profile.used_by,
  ).length;

  return (
    <div className="profile-overview-tab">
      {!featuresProfiles && (
        <Notification severity="caution" title={t("inherited-profile")}>
          {t("modifications-are-only-available-in-the")}{" "}
          <Link to={`/ui/project/default/profile/${profile.name}`}>
            {t("default-project")}
          </Link>
          .
        </Notification>
      )}
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">{t("general")}</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">{t("name")}</th>
                <td>
                  <ItemName item={profile} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">{t("description")}</th>
                <td>{profile.description ? profile.description : "-"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">{t("devices")}</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr className="list-wrapper">
                <th className="p-muted-heading">{t("networks")}</th>
                <td>
                  <ProfileNetworkList profile={profile} />
                </td>
              </tr>
              <tr className="list-wrapper">
                <th className="p-muted-heading">{t("storage")}</th>
                <td>
                  <ProfileStorageList profile={profile} />
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">{t("limits")}</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">CPU</th>
                <td>{profile.config["limits.cpu"] || "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">{t("memory")}</th>
                <td>{profile.config["limits.memory"] || "-"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row
        className={classnames("section", {
          "u-hide": !hasCloudInit,
        })}
      >
        <Col size={3}>
          <h2 className="p-heading--5">{t("cloud-init")}</h2>
        </Col>
        <Col size={7} className="view-config">
          <Link
            to={`/ui/project/${project}/profile/${
              profile.name
            }/configuration/${slugify(CLOUD_INIT)}`}
          >
            {t("view-configuration")}
          </Link>
        </Col>
      </Row>
      <Row className="usage list-wrapper">
        <Col size={3}>
          <h2 className="p-heading--5">Usage ({usageCount})</h2>
        </Col>
        <Col size={7}>
          {usageCount > 0 ? (
            <table>
              <tbody>
                <ProfileInstances
                  profile={profile}
                  project={project}
                  headingClassName="p-muted-heading"
                />
              </tbody>
            </table>
          ) : (
            <>-</>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfileDetailOverview;

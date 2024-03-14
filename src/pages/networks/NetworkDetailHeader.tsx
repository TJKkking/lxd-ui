import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { LxdNetwork } from "types/network";
import { renameNetwork } from "api/networks";
import DeleteNetworkBtn from "pages/networks/actions/DeleteNetworkBtn";
import { useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  network?: LxdNetwork;
  project: string;
}

const NetworkDetailHeader: FC<Props> = ({ name, network, project }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        t("a-network-with-this-name-already-exists"),
        (value) =>
          network?.name === value ||
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required(t("network-name-is-required")),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameNetwork(name, values.name, project)
        .then(() => {
          navigate(`/ui/project/${project}/network/${values.name}`);
          toastNotify.success(
            t("networkRenamed", { oldName: name, newName: values.name }),
          );
          void formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure(t("renaming-failed"), e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  const isUsed = (network?.used_by?.length ?? 0) > 0;
  const isManaged = network?.managed;

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link to={`/ui/project/${project}/networks`} key={1}>
          {t("networks")}
        </Link>,
      ]}
      renameDisabledReason={
        !isManaged
          ? t("can-not-rename-network-is-not-managed")
          : isUsed
            ? t("can-not-rename-network-is-currently-in-use")
            : undefined
      }
      controls={
        network && <DeleteNetworkBtn network={network} project={project} />
      }
      isLoaded={Boolean(network)}
      formik={formik}
    />
  );
};

export default NetworkDetailHeader;

import { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { useTranslation } from "react-i18next";

export interface ProfileDetailsFormValues {
  name: string;
  description?: string;
  entityType: "profile";
  readOnly: boolean;
}

export const profileDetailPayload = (values: CreateProfileFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

interface Props {
  formik: FormikProps<CreateProfileFormValues>;
  isEdit: boolean;
}

const ProfileDetailsForm: FC<Props> = ({ formik, isEdit }) => {
  const readOnly = formik.values.readOnly;
  const isDefaultProfile = formik.values.name === "default";
  const { t } = useTranslation();

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label={t("profile-name")}
            placeholder={t("enter-name")}
            help={
              isEdit &&
              !isDefaultProfile &&
              t("click-the-name-in-the-header-to-rename-the-profile")
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            required
            disabled={isEdit}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label={t("description")}
            placeholder={t("enter-description")}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            disabled={readOnly}
            dynamicHeight
          />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProfileDetailsForm;

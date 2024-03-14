import { FC, useState } from "react";
import { Button, Form, Textarea, useNotify } from "@canonical/react-components";
import { addCertificate } from "api/certificates";
import { useTranslation } from "react-i18next";

const CertificateAddForm: FC = () => {
  const notify = useNotify();
  const [token, setToken] = useState("");
  const { t } = useTranslation();

  const useToken = () => {
    const sanitisedToken =
      token
        .trim()
        .split(/\r?\n|\r|\n/g)
        .at(-1) ?? "";

    addCertificate(sanitisedToken)
      .then(() => {
        location.reload();
      })
      .catch((e) => notify.failure(t("error-using-token"), e));
  };

  return (
    <Form>
      <Textarea
        id="token"
        name="token"
        label={t("paste-the-token-from-the-previous-step")}
        placeholder={t("paste-your-token-here")}
        rows={3}
        onChange={(e) => setToken(e.target.value)}
      />
      <Button
        appearance="positive"
        disabled={token.length < 1}
        type="button"
        onClick={useToken}
      >
        {t("import")}
      </Button>
    </Form>
  );
};

export default CertificateAddForm;

import { FC } from "react";
import { Button, Col, Icon, Row } from "@canonical/react-components";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
import CustomLayout from "components/CustomLayout";
import { useTranslation } from "react-i18next";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const { t } = useTranslation();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <CustomLayout>
      <Row className="empty-state">
        <Col size={6} className="col-start-large-4">
          <Icon name="containers" className="empty-state-icon lxd-icon" />
          <h1 className="p-heading--4 u-sv-2">{t("login")}</h1>
          {hasOidc && (
            <>
              <p className="u-sv1">{t("choose-your-login-method")}</p>
              <a className="p-button--positive" href="/oidc/login">
                {t("login-with-sso")}
              </a>
              <h2 className="p-heading--5 u-sv-2">{t("other-methods")}</h2>
              <div>
                {t("either")}{" "}
                <Link to="/ui/login/certificate-generate">
                  {t("create-a-new-certificate-0")}
                </Link>
              </div>
              <div>
                {t("or")}{" "}
                <Link to="/ui/login/certificate-add">
                  {t("use-an-existing-certificate")}
                </Link>{" "}
                {t("already-added-to-your-browser")}
              </div>
            </>
          )}
          {!hasOidc && (
            <>
              <p className="u-sv1">{t("certificate-selection")}</p>
              <Button
                appearance={"positive"}
                onClick={() => navigate("/ui/login/certificate-generate")}
              >
                {t("create-a-new-certificate")}
              </Button>
              <p>
                {t("or")}{" "}
                <Link to="/ui/login/certificate-add">
                  {t("use-an-existing-certificate")}
                </Link>{" "}
                {t("already-added-to-your-browser")}
              </p>
            </>
          )}
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default Login;

import {
  Card,
  Col,
  Progress,
  Row,
} from "antd";
import { FC, ReactElement, useEffect, useState } from "react";
import type {
  IDashboardOrganizationSummary,
} from "@/app/common/dashbaord";
import { useRouter } from "next/navigation";
import { FileImage, FileVideoCamera } from "lucide-react";
import { formatNumber } from "@/app/utils/format";
interface props {
  organization?: IDashboardOrganizationSummary;
  session: any;
}

const CardOrganization: FC<props> = ({
  organization,
  session,
}): ReactElement => {
  const navigate = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div>
      <div className="text-[#99a1af] text-lg mb-2">Package Overview</div>{" "}
      <Row gutter={[isMobile ? 6 : 12, isMobile ? 3 : 4]}>
        <Col xs={24} sm={24} md={12}>
          <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
            <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
              <Card size="small">
                <div className=" flex justify-between mb-5">
                  <FileVideoCamera size={isMobile ? 20 : 30} color="#a8e063" />
                  <div className={isMobile ? "text-sm" : "text-lg"}>
                    Video Credit Usage
                  </div>
                </div>
                <div className=" grid grid-cols-3">
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Pagekage</div>
                    <div
                      className={`inline  text-white ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(organization?.packageTokenAmount)}
                    </div>
                  </div>
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Used</div>
                    <div
                      className={`inline  text-blue-400 ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(
                        (organization?.packageTokenAmount || 0) -
                          (organization?.remainTokenAmount || 0),
                      )}
                    </div>
                  </div>{" "}
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Remain</div>
                    <div
                      className={`inline  text-green-500 ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(organization?.remainTokenAmount)}
                    </div>
                  </div>
                </div>
                <div>
                  <Progress
                    strokeColor={"#a8e063"}
                    percent={
                      (((organization?.packageTokenAmount || 0) -
                        (organization?.remainTokenAmount || 0)) /
                        (organization?.packageTokenAmount || 0)) *
                      100
                    }
                    success={{
                      percent:
                        ((organization?.usedCredit || 0) * 100) /
                        (organization?.packageTokenAmount || 0),
                    }}
                    showInfo={false}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
            <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
              <Card size="small">
                <div className=" flex justify-between mb-5">
                  <FileImage size={isMobile ? 20 : 30} color="#667eea" />
                  <div className={isMobile ? "text-sm" : "text-lg"}>
                    Image Usage
                  </div>
                </div>
                <div className=" grid grid-cols-3">
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Pagekage</div>
                    <div
                      className={`inline  text-white ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(organization?.packageImageAmount || 0)}
                    </div>
                  </div>
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Used</div>
                    <div
                      className={`inline  text-blue-400 ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(
                        (organization?.packageImageAmount || 0) -
                          (organization?.remainImageAmount || 0),
                      )}
                    </div>
                  </div> 
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>Remain</div>
                    <div
                      className={`inline  text-green-500 ${
                        isMobile ? "text-[16px]" : "text-[20px]"
                      }`}
                    >
                      {formatNumber(organization?.remainImageAmount || 0)}
                    </div>
                  </div>
                </div>
                <div>
                  <Progress
                    strokeColor={"#667eea"}
                    percent={
                      (((organization?.packageImageAmount || 0) -
                        (organization?.remainImageAmount || 0)) /
                        (organization?.packageImageAmount || 0)) *
                      100
                    }
                    success={{
                      percent:
                        ((organization?.usedImage || 0) * 100) /
                        (organization?.packageImageAmount || 0),
                    }}
                    showInfo={false}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default CardOrganization;

import { Button, Card, Col, ConfigProvider, DatePicker, Form, FormInstance, Row } from "antd";
import { FC, ReactElement } from "react";
import { DollarOutlined } from "@ant-design/icons";
import type { ITDashboard } from "@/app/common/dashbaord";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
interface props {
  getdata?: ITDashboard;
  session: any;
}

const SummaryCardComponent: FC<props> = ({ getdata, session }): ReactElement => {
  const navigate = useRouter();
  return (
    <Row gutter={[12, 4]}>
      <Col sm={24} md={12}>
        <Row gutter={[12, 6]}>
          <Col sm={24} md={12}>
            <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
              <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
                <Card size="small">
                  <div className=" flex justify-between">
                    <div>Unpaid amount</div>
                    <DollarOutlined size={24} />
                  </div>
                  <div>
                    <div className=" inline font-bold text-white text-[20px]">COMING SOON</div>
                  </div>
                </Card>
              </div>
            </div>
          </Col>

          <Col sm={24} md={12}>
            <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
              <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
                <Card size="small">
                  <div className=" flex justify-between">
                    <div>Quota</div>
                    <DollarOutlined size={24} />
                  </div>
                  <div>
                    <div className=" inline font-bold text-white text-[20px]">$ {getdata?.quota?.toFixed(2)}</div> USD
                  </div>
                </Card>
              </div>
            </div>
          </Col>

          <Col sm={24} md={24}>
            <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
              <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
                <Card size="small">
                  <div className=" flex justify-between">
                    <div>Post-tax amount (Payment currency)</div>
                    <DollarOutlined size={24} />
                  </div>
                  <div className=" inline">
                    <div className=" inline font-bold text-white text-[20px]">$ {`${Number(getdata?.summaryUsed).toFixed(2)} `}</div>
                    <div className=" inline">
                      {` USD | `}
                      <div className=" text-[10px] inline-flex">
                        Pre-tax amount (payment currency): {<div className=" text-blue-700 font-bold">$3.67</div>}+ Tax(payment currency):{" "}
                        {<div className=" text-blue-700 font-bold">$3.67</div>}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Col>
        </Row>
      </Col>
      <Col sm={24} md={12}>
        <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
          <div className="bg-black hover:bg-black rounded-lg transition-all duration-300 h-full">
            <Card size="small" title={"Bill summary"} extra={<DollarOutlined size={24} />}>
              <div className=" grid md:grid-cols-2">
                <div>
                  <div>Month to date cost ({dayjs().format("MMM YY")})</div>
                  <div className=" inline">
                    <div className=" inline font-bold text-white text-[20px]">$ {`${Number(getdata?.sumPriceTokenUsedDateNow).toFixed(2)} `}</div> USD
                  </div>
                </div>
                <div>
                  <div>Last month’s total cost</div>
                  <div className=" inline">
                    <div className=" inline font-bold text-white text-[20px]">$ {`${Number(getdata?.sumPriceTokenUsedDateLast).toFixed(2)} `}</div>
                    USD
                  </div>
                </div>
                <div className=" md:col-span-2 mt-2">
                  <Button type="primary" className=" w-full " size="large" onClick={() => navigate.push(`dashboard/${session.user.id}`)}>
                    Bill details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Col>
    </Row>
  );
};
export default SummaryCardComponent;

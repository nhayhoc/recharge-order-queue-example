const logger = require("morgan");
const express = require("express");
const axios = require("axios");
const Queue = require("bee-queue");

const app = express();
app.use(logger("dev"));

const rechargeAndOrderQueue = new Queue("recharge-and-order", {
  redis: {
    host: "redis",
  },
});
let transferList = [];
rechargeAndOrderQueue.process(async (job) => {
  console.log(`Processing job ${job.id}`);
  if (job.data.job_type === "recharge") {
    if (!transferList.includes(job.data.tranId)) {
      //replace sleep ==> update payment && balance
      try {
        await sleep(500);
        transferList.push(job.data.tranId);
        return "new balance here";
      } catch (error) {
        // rollback if throw error
        // code rollback here ...
        throw error;
      }
    } else {
      return "tranId updated";
    }
  }
  if (job.data.job_type === "order") {
    // status product
    // update product sold _id user
    // update user balance
    // replace sleep
    try {
      await sleep(500);
      return {
        order_id: "this is order id",
      };
    } catch (error) {
      // rollback if throw error
      // code rollback here ...
      throw error;
    }
  }
  throw Error("not valid job_type");
});
async function GetTransfer() {
  // Lấy lịch sử giao dịch
  try {
    //REPLACE TO let { data } = await axios.get(API + "/api/transaction");
    let data =
      '[{"tranId":16385520000,"fromPartnerName":"ĐINH QUANG PHÚC","fromPartnerId":"0966730000","amount":48000,"payment_content":"coyna0000@gmail.com","status":"SUCCESS","status_description":"Thành công","time":"2021-09-09T04:39:39.375Z","gate":"MOMO"},{"tranId":16391870000,"fromPartnerName":"Hoàng Lam","fromPartnerId":"01205440000","amount":150000,"status":"SUCCESS","status_description":"Thành công","time":"2021-09-09T08:05:42.186Z","gate":"MOMO"},{"tranId":"FT2125207800000BNK","fromPartnerName":"","fromPartnerId":"","amount":"300000","payment_content":"CHUYEN TIEN DEN SO TAI KHOAN 222666 600000  DO HUYNH DUC FT21252555600000 - Ma giao dich/ Trace 570000","status":"SUCCESS","status_description":"mbbank","time":"2021-09-09T14:01:00.000Z","gate":"MBBANK"},{"tranId":"FT21252808600000BNK","fromPartnerName":"","fromPartnerId":"","amount":"1378000","payment_content":"FREE   DAU DUC DUONG   FACEBOOK COM  DUCDU0NG1710 09090000 - Ma giao dich/ Trace 160000","status":"SUCCESS","status_description":"mbbank","time":"2021-09-09T14:47:00.000Z","gate":"MBBANK"},{"tranId":16428020000,"fromPartnerName":"PHÙNG THỤY DIỄM THU","fromPartnerId":"0903120000","amount":114000,"payment_content":"toima0000@gmail.com","status":"SUCCESS","status_description":"Thành công","time":"2021-09-10T08:17:04.139Z","gate":"MOMO"},{"tranId":"FT2125304040000BNK","fromPartnerName":"","fromPartnerId":"","amount":"160000","payment_content":"LE DUC MANH chuyen tien - Ma giao d ich/ Trace 270000","status":"SUCCESS","status_description":"mbbank","time":"2021-10-09T09:00:00.000Z","gate":"MBBANK"},{"tranId":"FT21253678200000","fromPartnerName":"","fromPartnerId":"","amount":"0","payment_content":"DO HUYNH DUC chuyen khoan - Ma giao  dich/ Trace 310000","status":"SUCCESS","status_description":"mbbank","time":"2021-10-09T11:30:00.000Z","gate":"MBBANK"},{"tranId":"FT21256287238359BNK","fromPartnerName":"","fromPartnerId":"","amount":"1199000","payment_content":"MBVCB 13000000 DAM DUC LUO NG chuyen tien CT tu 03010000000 DAM DUC LUONG toi 2226600000 DO  HUYNH DUC  MB  Quan Doi - Ma giao d","status":"SUCCESS","status_description":"mbbank","time":null,"gate":"MBBANK"}]';
    data = JSON.parse(data);
    //
    let jobdata = data.map((el) =>
      rechargeAndOrderQueue.createJob({
        job_type: "recharge",
        ...el,
      })
    );
    let errors = await rechargeAndOrderQueue.saveAll(jobdata);
    errors.forEach((error) => {
      console.error(error);
    });
  } catch (error) {
    console.error(error);
  }
}
function CronGetTransfers(params) {
  GetTransfer();
  // setInterval(() => {
  //   GetTransfer();
  // }, 5000);
}
CronGetTransfers();
app.post("/order", function (req, res) {
  const job = rechargeAndOrderQueue.createJob({
    job_type: "order",
  });

  job.on("succeeded", function (result) {
    console.log("completed job " + job.id);
    res.send("success: " + result.order_id);
  });
  job.on("failed", function (error) {
    console.log("failed job " + job.id);
    res.status(500).send("error: " + error.message);
  });

  job.save(function (err) {
    if (err) {
      console.log("job failed to save");
      return res.status(500).send("error: job failed to save");
    }
    console.log("saved job " + job.id);
  });
});
app.post("/callback-card", function (req, res) {
  // get from req.body
  let body = {
    jwt_token: "fdsd",
  };

  //get from jwt_token
  let tranId = "012345678";

  //check jwt_token
  if (true) {
    const job = rechargeAndOrderQueue.createJob({
      job_type: "recharge",
      tranId,
      ...body,
    });

    job.on("succeeded", function () {
      console.log("completed job " + job.id);
      res.send(result);
    });
    job.on("failed", function (error) {
      console.log("failed job " + job.id);
      res.status(500).send("error: " + error.message);
    });

    job.save(function (err) {
      if (err) {
        console.log("job failed to save");
        return res.status(500).send("error: job failed to save");
      }
      console.log("saved job " + job.id);
    });
  }
});
const server = app.listen(process.env.PORT, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});

function sleep(timeout) {
  return new Promise((res) => setTimeout(() => res(), timeout));
}

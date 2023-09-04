import React , { useEffect, useState } from "react";
import { CircularProgress, Box , Typography } from "@material-ui/core";
import { donut } from "billboard.js";
import BBChart from "../BBChart";
import { dataToColors , isValidColumnName } from "../../utils/charts";
import { getConnectionStatusSummary } from "../../api/connections";
import ConnectClustersBtn from "../General/ConnectClustersBtn";
import Link from "next/link";
import { useNotification } from "../../utils/hooks/useNotification";
import { EVENT_TYPES } from "../../lib/event-types";

const notify=useNotification()

export default function ConnectionStatsChart({ classes }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getConnectionStatusSummary().then(json => {
      setChartData(json.connections_status
        .filter(data => isValidColumnName(data.status))
        .map(data => [data.status, data.count]));
    }).catch(e => {
      notify({ message : e, event_type : EVENT_TYPES.ERROR, details : e.toString() })
      setIsLoading(false);
    }).finally(() => {
      setIsLoading(false);
    })
  }, []);

  const chartOptions = {
    data : {
      columns : chartData,
      type : donut(),
      colors : dataToColors(chartData),
    },
    arc : {
      cornerRadius : {
        ratio : 0.05,
      },
    },
    donut : {
      title : "Connection Stats",
      padAngle : 0.03,
      label : {
        format : function (value) {
          return value;
        },
      },
    },
    tooltip : {
      format : {
        value : function (v) {
          return v;
        },
      },
    },
  };

  return (
    <div className={classes.dashboardSection}>
      <Link href="/management/connections">
        <Typography variant="h6" gutterBottom  className={classes.link}>
          Connections
        </Typography>
      </Link>
      <Box
        sx={{
          display : "flex",
          justifyContent : "center",
          alignItems : "center",
          alignContent : "center",
          height : "300px",
          width : "100%",
        }}
      >
        {isLoading ?
          <CircularProgress />
          : chartData.length > 0 ?
            <BBChart options={chartOptions} />
            : (
              <div
                style={{
                  padding : "2rem",
                  display : "flex",
                  justifyContent : "center",
                  alignItems : "center",
                  flexDirection : "column",
                }}
              >
                <Typography style={{ fontSize : "1.5rem", marginBottom : "1rem" }} align="center">
                 No connections found in your clusters
                </Typography>
                <ConnectClustersBtn/>
              </div>
            )
        }
      </Box>
    </div>
  );
}

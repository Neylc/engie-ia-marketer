"use client";

import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  // Removed unused/incorrect type imports
  // type GeographiesChildrenArgument,
  // type GeographyProps,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { CountryData } from "@/lib/data";
import { formatCurrency } from "@/lib/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Europe TopoJSON data URL
const geoUrl =
  "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson";

// Define the metric types
type MapMetric = "performance" | "totalSpend" | "conversions" | "cac";

// Configuration for each metric
const metricsConfig: Record<
  MapMetric,
  {
    label: string;
    format: (value: number) => string | number;
    domainDirection?: "normal" | "inverse"; // To handle scales where lower is better (like CAC)
  }
> = {
  performance: {
    label: "Performance",
    format: (value) => `${value.toFixed(1)}x`,
  },
  totalSpend: {
    label: "Total Spend",
    format: (value) => formatCurrency(value),
  },
  conversions: {
    label: "Conversions",
    format: (value) => value.toLocaleString(),
  },
  cac: {
    label: "CAC",
    format: (value) => formatCurrency(value),
    domainDirection: "inverse", // Lower CAC is better
  },
};

// Define the props for the component
interface EuropeMapChartProps {
  data: CountryData[];
}

// Define a local interface for the geo object passed by Geographies
// Matches the structure of objects within the TopoJSON features collection
interface GeoObject {
  rsmKey: string;
  properties: {
    NAME: string; // Country name (provided by this specific TopoJSON)
  };
  // Geometry data is implicitly included but not strictly typed here
}

// Engie-style blue color range
const COLOR_RANGE: [string, string] = ["#e0f2fe", "#005eb8"]; // Light Sky Blue to Darker Engie Blue
const DEFAULT_COLOR = "#E5E7EB"; // Gray for no data

const EuropeMapChart: React.FC<EuropeMapChartProps> = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] =
    useState<MapMetric>("performance");

  // Create a Map for efficient data lookup by country name
  const dataMap = useMemo(
    () => new Map(data.map((item) => [item.name, item])),
    [data]
  );

  // Calculate min/max for the selected metric dynamically
  const { min, max } = useMemo(() => {
    const values = data
      .map((item) => item[selectedMetric])
      .filter((v): v is number => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return { min: 0, max: 1 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data, selectedMetric]);

  // Create the color scale based on the selected metric and its domain
  const colorScale = useMemo(() => {
    const config = metricsConfig[selectedMetric];
    let domain = [min, max];
    // Handle inverse scale for CAC (lower is better -> darker blue)
    if (config.domainDirection === "inverse") {
      // Swap domain to map min to dark blue, max to light blue
      domain = [max, min];
    }
    // Handle case where min and max are the same
    if (domain[0] === domain[1]) {
      domain[1] = domain[0] + 1; // Avoid division by zero in scale
    }

    return scaleLinear<string>().domain(domain).range(COLOR_RANGE);
  }, [min, max, selectedMetric]);

  const handleMouseEnter = (geo: GeoObject) => {
    const countryName = geo.properties.NAME || "Unknown";
    const countryData = dataMap.get(countryName);
    const metricConfig = metricsConfig[selectedMetric];

    if (countryData) {
      const value = countryData[selectedMetric];
      setTooltipContent(
        <div>
          <p className="font-semibold text-sm">{countryName}</p>
          <p className="text-xs">
            {metricConfig.label}:{" "}
            {typeof value === "number" && !isNaN(value)
              ? metricConfig.format(value)
              : "N/A"}
          </p>
          {/* Optionally show other metrics too */}
          {/* <p className="text-xs text-muted-foreground">Budget: {formatCurrency(countryData.budget ?? 0)}</p> */}
        </div>
      );
    } else {
      setTooltipContent(
        <div>
          <p className="font-semibold text-sm">{countryName}</p>
          <p className="text-xs text-muted-foreground">No data available</p>
        </div>
      );
    }
    setTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    setTooltipOpen(false);
  };

  return (
    <div className="w-full">
      {/* Metric Selection Buttons */}
      <div className="flex justify-center space-x-2 mb-4">
        {(Object.keys(metricsConfig) as MapMetric[]).map((metric) => (
          <Button
            key={metric}
            variant={selectedMetric === metric ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMetric(metric)}
            className={cn(
              "transition-colors",
              selectedMetric !== metric &&
                "text-muted-foreground hover:bg-accent"
            )}
          >
            {metricsConfig[metric].label}
          </Button>
        ))}
      </div>

      {/* Map and Tooltip */}
      <TooltipProvider delayDuration={100}>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <div style={{ outline: "none" }} tabIndex={-1}></div>
          </TooltipTrigger>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              rotate: [-10.0, -53.0, 0],
              scale: 550,
            }}
            style={{ width: "100%", height: "auto" }}
            aria-label={`Map of Europe showing ${metricsConfig[selectedMetric].label} by country`}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeoObject[] }) =>
                geographies.map((geo) => {
                  const countryData = dataMap.get(geo.properties.NAME);
                  const metricValue = countryData?.[selectedMetric];

                  const fillColor =
                    typeof metricValue === "number" && !isNaN(metricValue)
                      ? colorScale(metricValue)
                      : DEFAULT_COLOR;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#FFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: fillColor,
                          opacity: 0.8,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          <TooltipContent
            className="bg-background text-foreground border border-border shadow-lg rounded-md px-3 py-1.5 text-sm"
            sideOffset={5}
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default EuropeMapChart;

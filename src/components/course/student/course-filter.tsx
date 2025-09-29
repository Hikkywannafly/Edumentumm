"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseLevel } from "@/types/course.type";
import { Label } from "@radix-ui/react-label";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface FilterOptions {
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

interface CourseFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  maxPriceValue?: number;
}

export function CourseFilter({
  onFilterChange,
  maxPriceValue = 1000,
}: CourseFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    maxPriceValue,
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  // Refs to avoid stale closure issues
  const priceRangeRef = useRef(priceRange);
  const isDraggingRef = useRef(isDragging);

  // Update refs when state changes
  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange({
      search: value.trim() === "" ? undefined : value.trim(),
    });
  }, 500);

  const debouncedPriceChange = useDebouncedCallback(
    (value: [number, number]) => {
      onFilterChange({
        minPrice: value[0] > 0 ? value[0] : undefined,
        maxPrice: value[1] < maxPriceValue ? value[1] : undefined,
      });
    },
    500,
  );

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    debouncedPriceChange(value);
  };

  const handleMinPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newMin = Math.max(
      0,
      Math.min(Number.parseInt(e.target.value) || 0, priceRange[1] - 10),
    );
    handlePriceChange([newMin, priceRange[1]]);
  };

  const handleMaxPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newMax = Math.min(
      maxPriceValue,
      Math.max(
        Number.parseInt(e.target.value) || maxPriceValue,
        priceRange[0] + 10,
      ),
    );
    handlePriceChange([priceRange[0], newMax]);
  };

  // Custom slider handlers
  const handleMouseDown = (e: React.MouseEvent, thumb: "min" | "max") => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  // Mouse event listeners
  useEffect(() => {
    if (!isDragging) return;

    const sliderElement = document.querySelector(".price-slider-track");
    if (!sliderElement) return;

    const sliderRect = sliderElement.getBoundingClientRect();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const currentDragging = isDraggingRef.current;
      const currentRange = priceRangeRef.current;

      if (!currentDragging) return;

      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - sliderRect.left) / sliderRect.width),
      );
      const newValue = Math.round((percentage * maxPriceValue) / 10) * 10;

      if (currentDragging === "min") {
        const newMin = Math.max(0, Math.min(newValue, currentRange[1] - 10));
        const newRange: [number, number] = [newMin, currentRange[1]];
        setPriceRange(newRange);
        debouncedPriceChange(newRange);
      } else if (currentDragging === "max") {
        const newMax = Math.min(
          maxPriceValue,
          Math.max(newValue, currentRange[0] + 10),
        );
        const newRange: [number, number] = [currentRange[0], newMax];
        setPriceRange(newRange);
        debouncedPriceChange(newRange);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, maxPriceValue, debouncedPriceChange]);

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);

    if (value === "All Levels" || value === "all") {
      onFilterChange({
        level: undefined,
      });
    } else {
      onFilterChange({
        level: value as CourseLevel,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setPriceRange([0, maxPriceValue]);

    onFilterChange({
      search: undefined,
      level: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="course-search-input">
          Search Courses
        </label>
        <Input
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          id="course-search-input"
        />
      </div>

      {/* Price Range + Course Level cùng 1 hàng */}
      <div className="flex items-start gap-12">
        {/* Price Range */}
        <div className="flex w-1/3 flex-col">
          <label className="mb-3 font-medium text-sm" htmlFor="price-range">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>

          {/* Slider */}
          <div className="relative mt-2 w-full" id="price-range">
            <div className="price-slider-track relative h-1.5 rounded-full bg-gray-200">
              <div
                className="absolute h-1.5 rounded-full bg-black"
                style={{
                  left: `${(priceRange[0] / maxPriceValue) * 100}%`,
                  width: `${((priceRange[1] - priceRange[0]) / maxPriceValue) * 100}%`,
                }}
              />
              <div
                className="-translate-x-1/2 -translate-y-1/3 absolute h-4 w-4 transform cursor-pointer rounded-full border-2 border-black bg-white"
                style={{
                  left: `${(priceRange[0] / maxPriceValue) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, "min")}
              />
              <div
                className="-translate-x-1/2 -translate-y-1/3 absolute h-4 w-4 transform cursor-pointer rounded-full border-2 border-black bg-white"
                style={{
                  left: `${(priceRange[1] / maxPriceValue) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, "max")}
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={handleMinPriceInputChange}
              className="w-20 text-sm"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={handleMaxPriceInputChange}
              className="w-20 text-sm"
            />
          </div>
        </div>

        {/* Course Level */}

        <div className="space-y-2">
          <Label htmlFor="courseLevel" className="font-medium text-sm">
            Course Level
          </Label>
          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger id="courseLevel">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {Object.values(CourseLevel).map((level) => (
                <SelectItem key={level} value={level}>
                  {level.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={clearFilters}
          className="text-muted-foreground text-sm underline hover:text-foreground"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}

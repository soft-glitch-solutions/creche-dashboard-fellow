import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock Data for Photos (using placeholder images)
const photosByYear = {
  2025: {
    January: [
        "https://images.theconversation.com/files/445149/original/file-20220208-22-80f5sj.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop",
        "https://as2.ftcdn.net/jpg/02/48/12/47/1000_F_248124717_JjTxDAF3XFVkqvR0HBe56dOGWtly19QA.webp",
    ],
    February: [
        "https://images.theconversation.com/files/445149/original/file-20220208-22-80f5sj.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop",
        "https://as2.ftcdn.net/jpg/02/48/12/47/1000_F_248124717_JjTxDAF3XFVkqvR0HBe56dOGWtly19QA.webp",
    ],
    // Add more months as needed
  },
  2024: {
    January: [
      "https://images.theconversation.com/files/445149/original/file-20220208-22-80f5sj.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop",
      "https://as2.ftcdn.net/jpg/02/48/12/47/1000_F_248124717_JjTxDAF3XFVkqvR0HBe56dOGWtly19QA.webp",
    ],
    February: [
        "https://images.theconversation.com/files/445149/original/file-20220208-22-80f5sj.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop",
        "https://as2.ftcdn.net/jpg/02/48/12/47/1000_F_248124717_JjTxDAF3XFVkqvR0HBe56dOGWtly19QA.webp",
    ],
    // Add more months as needed
  },
};

const PhotoBook = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const years = Object.keys(photosByYear);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null); // Reset the month when a new year is selected
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
  };

  const handlePrintPreview = () => {
    setIsPreviewVisible(true);
  };

  const handlePrint = () => {
    alert("This will generate a printable photo book for the selected year/month.");
    // In the real-world scenario, you would generate a PDF here.
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Photo Book</h2>
        <p className="text-muted-foreground">
          Select a year to view the months and photos
        </p>
      </div>

      <div className="grid gap-4">
        {/* Display Years */}
        <div className="flex gap-4 flex-wrap">
          {years.map((year) => (
            <Card key={year} className="p-6 cursor-pointer" onClick={() => handleYearSelect(Number(year))}>
              <h3 className="text-xl font-semibold">{year}</h3>
            </Card>
          ))}
        </div>

        {selectedYear && (
          <div>
            <h3 className="text-2xl font-bold">Select a Month from {selectedYear}</h3>
            <div className="grid gap-4 grid-cols-3">
              {/* Display Months */}
              {Object.keys(photosByYear[selectedYear]).map((month) => (
                <Card
                  key={month}
                  className="p-4 cursor-pointer"
                  onClick={() => handleMonthSelect(month)}
                >
                  <h4 className="text-xl font-semibold">{month}</h4>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedMonth && selectedYear && (
          <div>
            <h3 className="text-2xl font-bold">
              Photos for {selectedMonth} {selectedYear}
            </h3>
            <div className="grid gap-4 grid-cols-3">
              {/* Display Photos */}
              {photosByYear[selectedYear][selectedMonth].map((photo, index) => (
                <Card key={index} className="p-4">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-auto" />
                </Card>
              ))}
            </div>
            <Button className="mt-4" onClick={handlePrintPreview}>Preview Photo Book</Button>
          </div>
        )}

        {selectedYear && !selectedMonth && (
          <div>
            <h3 className="text-2xl font-bold">Full Year View for {selectedYear}</h3>
            {/* Display All Photos for the Selected Year */}
            {Object.keys(photosByYear[selectedYear]).map((month) => (
              <div key={month}>
                <h4 className="text-xl font-semibold mt-4">{month}</h4>
                <div className="grid gap-4 grid-cols-3">
                  {photosByYear[selectedYear][month].map((photo, index) => (
                    <Card key={index} className="p-4">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-auto" />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            <Button className="mt-4" onClick={handlePrintPreview}>Preview Full Year Photo Book</Button>
          </div>
        )}
      </div>

      {isPreviewVisible && (
        <div className="preview-section">
          <h3 className="text-3xl font-bold">Photo Book Preview</h3>
          <div className="photo-book-preview">
            <div className="year-section">
              <h4 className="text-2xl font-bold">{selectedYear}</h4>
              {selectedMonth ? (
                <div className="month-section">
                  <h5 className="text-xl font-semibold">{selectedMonth}</h5>
                  <div className="photos-grid">
                    {photosByYear[selectedYear][selectedMonth].map((photo, index) => (
                      <img key={index} src={photo} alt={`Photo ${index + 1}`} className="photo-preview" />
                    ))}
                  </div>
                </div>
              ) : (
                Object.keys(photosByYear[selectedYear]).map((month) => (
                  <div key={month} className="month-section">
                    <h5 className="text-xl font-semibold">{month}</h5>
                    <div className="photos-grid">
                      {photosByYear[selectedYear][month].map((photo, index) => (
                        <img key={index} src={photo} alt={`Photo ${index + 1}`} className="photo-preview" />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Button className="mt-4" onClick={handlePrint}>Download Photo Book</Button>
        </div>
      )}
    </div>
  );
};

export default PhotoBook;

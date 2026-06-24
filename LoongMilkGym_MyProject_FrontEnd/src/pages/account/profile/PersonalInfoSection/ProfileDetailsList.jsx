import React from "react";
import { GENDER_OPTIONS, FITNESS_LEVEL_OPTIONS, GOAL_OPTIONS } from "./constants";
import CustomSelect from "@/components/common/CustomSelect";

function ProfileDetailsList({
  formData,
  isEditing,
  handleChange,
  formatDateDisplay
}) {
  const fields = [
    { label: "Họ và tên", name: "fullName", type: "text" },
    { label: "Số điện thoại", name: "phone", type: "text" },
    { 
      label: "Ngày sinh", 
      name: "birthDate", 
      type: "date",
      renderVal: (v) => formatDateDisplay(v)
    },
    { 
      label: "Giới tính", 
      name: "gender", 
      type: "select",
      options: GENDER_OPTIONS
    },
    { label: "Địa chỉ", name: "address", type: "text" },
    { 
      label: "Trình độ thể chất", 
      name: "fitnessLevel", 
      type: "select",
      options: FITNESS_LEVEL_OPTIONS
    },
    { 
      label: "Mục tiêu tập luyện", 
      name: "goal", 
      type: "select",
      options: GOAL_OPTIONS
    },
    { label: "Tiểu sử (Bio)", name: "bio", type: "text" }
  ];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
      <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-5 m-0 text-left">
        Chi tiết hồ sơ
      </h3>
      
      <div className="flex flex-col">
        {fields.map((field, idx, arr) => (
          <div 
            key={field.name}
            className={`flex flex-col sm:flex-row sm:items-center py-4 gap-2 sm:gap-6 min-h-[64px] text-left ${
              idx !== arr.length - 1 ? "border-b border-[var(--border-color)]" : ""
            }`}
          >
            <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44 shrink-0">{field.label}</span>
            <div className="flex-1">
              {isEditing ? (
                field.type === "select" ? (
                  <CustomSelect
                    value={formData[field.name]}
                    onChange={(val) =>
                      handleChange({ target: { name: field.name, value: val } })
                    }
                    options={field.options.map((opt) => {
                      const val = typeof opt === "object" ? opt.value : opt;
                      const lbl = typeof opt === "object" ? opt.label : opt;
                      return { label: lbl, value: val };
                    })}
                    placeholder={`Chọn ${field.label.toLowerCase()}`}
                    variant="form"
                    className="max-w-md"
                  />
                ) : (
                  <input 
                    type={field.type} 
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    max={field.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                    className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                )
              ) : (
                <span className="text-sm font-bold text-[var(--text-color)]">
                  {field.renderVal ? field.renderVal(formData[field.name]) : (formData[field.name] || "--")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileDetailsList;

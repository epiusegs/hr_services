// Copyright (c) 2024, Elite Resources and contributors
// For license information, please see license.txt

frappe.ui.form.on('Costing Sheet', {
	onload: function(frm){
		if(frm.is_new()){
			frm.set_value("transfer_fee",2000);
			frm.set_value("transaction_fee",5);
			frm.set_value("iqama_fee",650);
			frm.set_value("wl_fee",9700);
			frm.set_value("exit_re_entry",200);
			frm.set_value("salary_transfer_fee", 0.10);
		}
	},
	sheet_type: function(frm){
		if(frm.doc.sheet_type == "Cenomi"){
			frm.set_value("vt_allowance", 0);
			frm.set_value("neom_allowance", 0);
			frm.set_value("relocation_allowance", 0);
			frm.set_value("recruitment_cost", 0);

			calc_total_salary(frm);
			calc_oh_cost_total(frm);
		}
	},
	employee_id: function(frm) {
		if(frm.doc.employee_id){
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "Employee",
					name: frm.doc.employee_id,
				},
				callback(r) {
					if(r.message) {
						var d = r.message;
						//console.log(d);
						frm.set_value("employee_name", d.employee_name);
						frm.set_value("id_or_iqama", d.iqama_national_id);
						frm.set_value("nationality", d.nationality);
						frm.set_value("job_title", d.designation);
						frm.set_value("basic", d.basic_salary);
						frm.set_value("housing", d.housing_allowance);
						frm.set_value("transport", d.transport_allowance);
						frm.set_value("mobile", d.mobile_allowance);
						frm.set_value("food", d.food_allowance);
						let total_salry = (d.basic_salary + d.housing_allowance + d.transport_allowance + d.mobile_allowance + d.food_allowance);
						frm.set_value("total_salary", total_salry);
						if(frm.doc.nationality == "Saudi Arabia"){
							frm.set_value("gosi", (d.basic_salary + d.housing_allowance) * 0.1175);
						}
						else{
							frm.set_value("gosi", (d.basic_salary + d.housing_allowance) * 0.02);
						}
						frm.set_value("end_of_services", (((frm.doc.basic + frm.doc.housing + frm.doc.transport) / 2 ) / 12));
						frm.set_value("oh_cost_total", frm.doc.gosi + frm.doc.end_of_services);
					}
				}
			});
		}
	},
	basic: function(frm){
		calc_total_salary(frm);
		calc_gosi(frm);
		calc_eos(frm);
		calc_oh_cost_total(frm);
	},
	housing: function(frm){
		calc_total_salary(frm);
		calc_gosi(frm);
		calc_eos(frm);
		calc_oh_cost_total(frm);
	},
	transport: function(frm){
		calc_total_salary(frm);
		calc_eos(frm);
		calc_oh_cost_total(frm);
	},
	mobile: function(frm){
		calc_total_salary(frm);
	},
	vt_allowance: function(frm){
		calc_total_salary(frm);
	},
	neom_allowance: function(frm){
		calc_total_salary(frm);
	},
	gasoline: function(frm){
		calc_total_salary(frm);
	},
	food: function(frm){
		calc_total_salary(frm);
	},
	transfer_fee: function(frm){
		frm.set_value("monthly_transfer_fee", frm.doc.transfer_fee / 12 );
		calc_oh_cost_total(frm);
	},
	transaction_fee: function(frm){
		calc_oh_cost_total(frm);
	},
	iqama_fee: function(frm){
		frm.set_value("monthly_iqama_fee", frm.doc.iqama_fee / 12 );
		calc_oh_cost_total(frm);
	},
	wl_fee: function(frm){
		frm.set_value("monthly_wl_fee", frm.doc.wl_fee / 12 );
		calc_oh_cost_total(frm);
	},
	leave_per_year_in_days: function(frm){
		let leave_amt_per_month = (((((frm.doc.basic || 0) + (frm.doc.housing || 0) + (frm.doc.transport || 0)) / 30 ) * frm.doc.leave_per_year_in_days ) / 12);
		frm.set_value("leave_amt_per_month", leave_amt_per_month);
		calc_oh_cost_total(frm);
	},
	exit_re_entry: function(frm){
		calc_Monthly_exitRE_TicktAmt(frm);
		calc_family_ta_re(frm);
		calc_oh_cost_total(frm);
	},
	ticket_amount: function(frm){
		calc_Monthly_exitRE_TicktAmt(frm);
		calc_family_ta_re(frm);
		calc_oh_cost_total(frm);
	},
	vacation_entitlement: function(frm){
		calc_Monthly_exitRE_TicktAmt(frm);
		calc_family_ta_re(frm);
		calc_oh_cost_total(frm);
	},
	relocation_allowance: function(frm){
		calc_oh_cost_total(frm);
	},
	applicable: function(frm){
		if(frm.doc.applicable == "No"){
			frm.set_value("for_wife", 0);
			frm.set_value("for_childs", 0);
		}
	},
	insurance_class: function(frm){
		if(frm.doc.insurance_class){
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "Insurance Category",
					name: frm.doc.insurance_class,
				},
				callback(r) {
					if(r.message) {
						var d = r.message;
						frm.set_value("yearly_med_inc", d.price_for_emp);
						frm.set_value("monthly_med_inc", d.price_for_emp / 12);
						calc_oh_cost_total(frm);
					}
				}
			});
		}
	},
	for_wife: function(frm){
		if(frm.doc.insurance_class && frm.doc.for_wife == 1){
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "Insurance Category",
					name: frm.doc.insurance_class,
				},
				callback(r) {
					if(r.message) {
						var d = r.message;
						frm.set_value("wife_med_ins_yearly", d.price_for_emp_wife);
						frm.set_value("wife_med_ins_monthly", d.price_for_emp_wife / 12);
						calc_family_ta_re(frm);
						calc_oh_cost_total(frm);
					}
				}
			});
		}
		else{
			frm.set_value("wife_med_ins_yearly", 0);
			frm.set_value("wife_med_ins_monthly", 0);
			calc_family_ta_re(frm);
			calc_oh_cost_total(frm);
		}
	},
	for_childs: function(frm){
		if(frm.doc.for_childs == 0){
			frm.set_value("no_of_children",0);
			frm.set_value("chs_med_ins_yearly", 0);
			frm.set_value("chs_med_ins_monthly", 0);
			calc_family_ta_re(frm);
			calc_oh_cost_total(frm);
		}
	},
	no_of_children: function(frm){
		if(frm.doc.insurance_class && frm.doc.for_childs == 1){
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "Insurance Category",
					name: frm.doc.insurance_class,
				},
				callback(r) {
					if(r.message) {
						var d = r.message;
						frm.set_value("chs_med_ins_yearly", d.price_for_emp_child * frm.doc.no_of_children);
						frm.set_value("chs_med_ins_monthly", (d.price_for_emp_child / 12) * frm.doc.no_of_children);
						calc_family_ta_re(frm);
						calc_oh_cost_total(frm);
					}
				}
			});
		}
	},
	recruitment_cost: function(frm){
		calc_oh_cost_total(frm);
	},
	erc_fee: function(frm){
		calc_totals(frm);
	},
	//Misk tab calculation and code
	employee_id_m: function(frm) {
		if(frm.doc.employee_id_m){
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "Employee",
					name: frm.doc.employee_id_m,
				},
				callback(r) {
					if(r.message) {
						var d = r.message;
						//console.log(d);
						frm.set_value("employee_name_m", d.employee_name);
						frm.set_value("nationality_m", d.nationality);
						frm.set_value("designation_m", d.designation);
					}
				}
			});
		}
	},
	monthly_pkg_amt: function(frm){
		let daily_rate = frm.doc.monthly_pkg_amt / 30;
		frm.set_value("daily_rate", daily_rate);
		frm.set_value("salary_transfer_fee", 0.10);
		frm.set_value("agency_fee", daily_rate * 0.08);
		let total_daily_rate = frm.doc.daily_rate + frm.doc.salary_transfer_fee + frm.doc.agency_fee;
		frm.set_value("total_daily_rate", total_daily_rate);
	},
	total_package: function(frm){
		let basic = frm.doc.total_package / 1.35;
		frm.set_value("basic_pm", basic);
		frm.set_value("housing_pm", basic * 0.25);
		frm.set_value("transportation_pm", basic * 0.1);
		frm.set_value("basic_pd", basic / 30);
		frm.set_value("housing_pd", (basic * 0.25)/30);
		frm.set_value("transportation_pd", (basic * 0.1)/30);
		frm.set_value("total_pm", frm.doc.basic_pm + frm.doc.housing_pm + frm.doc.transportation_pm);
		frm.set_value("total_pd", frm.doc.basic_pd + frm.doc.housing_pd + frm.doc.transportation_pd);
	}
});

//function for calculating Monthly Exit Re-Entry(exitRE) and Ticket Amount Monthly
function calc_Monthly_exitRE_TicktAmt(frm){
	if(frm.doc.vacation_entitlement == "Yearly"){
		if(frm.doc.exit_re_entry){
			frm.set_value("exit_re_entry_monthly", frm.doc.exit_re_entry / 12 );
		}
		if(frm.doc.ticket_amount){
			frm.set_value("ticket_amount_monthly", frm.doc.ticket_amount / 12 );
		}
	}
	else if(frm.doc.vacation_entitlement == "Every Two Year"){
		if(frm.doc.exit_re_entry){
			frm.set_value("exit_re_entry_monthly", frm.doc.exit_re_entry / 24 );
		}
		if(frm.doc.ticket_amount){
			frm.set_value("ticket_amount_monthly", frm.doc.ticket_amount / 24 );
		}
	}
}

//function for family ticket amount and exit re entry
function calc_family_ta_re(frm){
	if(frm.doc.for_wife == 1 && frm.doc.for_childs == 0){
		frm.set_value("family_ta_yearly", frm.doc.ticket_amount);
		frm.set_value("family_ta_monthly", frm.doc.ticket_amount_monthly);
		frm.set_value("family_exit_re_yearly", frm.doc.exit_re_entry);
		frm.set_value("family_exit_re_monthly", frm.doc.exit_re_entry_monthly);
	}
	else if(frm.doc.for_wife == 0 && frm.doc.for_childs == 1){
		frm.set_value("family_ta_yearly", frm.doc.ticket_amount * frm.doc.no_of_children );
		frm.set_value("family_ta_monthly", frm.doc.ticket_amount_monthly * frm.doc.no_of_children);
		frm.set_value("family_exit_re_yearly", frm.doc.exit_re_entry * frm.doc.no_of_children);
		frm.set_value("family_exit_re_monthly", frm.doc.exit_re_entry_monthly * frm.doc.no_of_children);
	}
	else if(frm.doc.for_wife == 1 && frm.doc.for_childs == 1){
		frm.set_value("family_ta_yearly", frm.doc.ticket_amount * (frm.doc.no_of_children + 1));
		frm.set_value("family_ta_monthly", frm.doc.ticket_amount_monthly * (frm.doc.no_of_children + 1));
		frm.set_value("family_exit_re_yearly", frm.doc.exit_re_entry * (frm.doc.no_of_children + 1));
		frm.set_value("family_exit_re_monthly", frm.doc.exit_re_entry_monthly * (frm.doc.no_of_children + 1));
	}
	else{
		frm.set_value("family_ta_yearly", 0);
		frm.set_value("family_ta_monthly", 0);
		frm.set_value("family_exit_re_yearly", 0);
		frm.set_value("family_exit_re_monthly", 0);
	}
	
}

//function for calculationg total salary of employee
function calc_total_salary(frm){
	let total_salary = 0;

	total_salary += frm.doc.basic ?? 0;
	total_salary += frm.doc.housing ?? 0;
	total_salary += frm.doc.transport ?? 0;
	total_salary += frm.doc.mobile ?? 0;
	total_salary += frm.doc.vt_allowance ?? 0;
	total_salary += frm.doc.neom_allowance ?? 0;
	total_salary += frm.doc.gasoline ?? 0;
	total_salary += frm.doc.food ?? 0;

	frm.set_value("total_salary", total_salary);
	calc_totals(frm);
}

//calculating gosi and end of services on the basis of basic and housing 
function calc_gosi(frm){
	if(frm.doc.nationality == "Saudi Arabia"){
		let gosi = (((frm.doc.basic || 0) + (frm.doc.housing || 0)) * 0.1175);
		frm.set_value("gosi", gosi);
	}
	else{
		let gosi = (((frm.doc.basic || 0) + (frm.doc.housing || 0)) * 0.02);
		frm.set_value("gosi", gosi);
	}
}

//calculating end of service of employee
function calc_eos(frm){
	let eos_amt = ((((frm.doc.basic || 0) + (frm.doc.housing || 0) + (frm.doc.transport || 0)) / 2 ) / 12);
	frm.set_value("end_of_services", eos_amt);
}

//calculating total OH Cost on all expenses, fees, benefits of employee
function calc_oh_cost_total(frm){
	let total_oh_cost = 0;

    total_oh_cost += frm.doc.gosi ?? 0;
    total_oh_cost += frm.doc.transaction_fee ?? 0;
    total_oh_cost += frm.doc.monthly_transfer_fee ?? 0;
    total_oh_cost += frm.doc.monthly_iqama_fee ?? 0;
    total_oh_cost += frm.doc.monthly_wl_fee ?? 0;

    total_oh_cost += frm.doc.leave_amt_per_month ?? 0;
    total_oh_cost += frm.doc.exit_re_entry_monthly ?? 0;
    total_oh_cost += frm.doc.ticket_amount_monthly ?? 0;
    total_oh_cost += frm.doc.end_of_services ?? 0;
	total_oh_cost += frm.doc.relocation_allowance ?? 0;

    total_oh_cost += frm.doc.monthly_med_inc ?? 0;
	total_oh_cost += frm.doc.wife_med_ins_monthly ?? 0;
	total_oh_cost += frm.doc.chs_med_ins_monthly ?? 0;
	total_oh_cost += frm.doc.family_ta_monthly ?? 0;
	total_oh_cost += frm.doc.family_exit_re_monthly ?? 0;
	total_oh_cost += frm.doc.recruitment_cost ?? 0;

    frm.set_value("oh_cost_total", total_oh_cost);
	calc_totals(frm);
    //console.log(total_oh_cost);
    frm.refresh();
}

//calculating totals
function calc_totals(frm){
	let total_with_erc = 0;
	total_with_erc += frm.doc.oh_cost_total ?? 0;
	total_with_erc += frm.doc.erc_fee ?? 0;

	frm.set_value("total_with_erc", total_with_erc);

	let total_cost = 0;
	total_cost += frm.doc.total_salary ?? 0;
	total_cost += frm.doc.total_with_erc ?? 0;
	
	frm.set_value("total_cost", total_cost);
}
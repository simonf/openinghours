require.paths.unshift('.');
openinghours=require('openinghours');
var examples = ["aaaa","Mon-Fri 09:00-19:00","Mon-Fri 09:00-18:00, Sat 09:30-19:00", "Mon-Tue 09:00-18:00, Wed 09:30-12:00, Fri-Sat 10:00-16:00", 
				"Sat-Sun 9:00-12:00 13:00-19:00", "Sat-Sun: 9:00-12:00, 13:00-17:00, Tue-Thu 9:30 - 23:00"];
var dt = new Date();
for(i=0;i<examples.length;i++) {
	if(openinghours.checkOpeningHours(dt,examples[i])) console.log(examples[i]+" is open!");
	console.log(openinghours.showClosedOrClosing(dt,examples[i]));
}


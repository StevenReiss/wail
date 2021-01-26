#! /bin/csh -f

set group = $1
shift
set lesson = $1
shift

set rsltdir = /pro/web/web/courses/cs132/results/lab_$lesson

set tgtdir = $rsltdir/Group_$group
set host = pk-ssh.cs.brown.edu


ssh $host mkdir -p $tdtdir



if ("X$1" == "X-x") then
   shift
   set file = ${1:t}
   scp $1 ${host}:$tgtdir
   ssh $host ( cd $tgtdir; unzip $file
   echo handle compressed file
else				
   while (( "$#" >= 2))
      set f = $1
      set tgt = $2
      scp $1 ${host}:$tgtdir/$tgt
      shift 2
   end
endif

ssh $host (cd $rsltdir; ./updatedir.csh )































